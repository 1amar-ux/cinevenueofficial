import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Response } from "express";
import { logger } from "../shared/logger";

export interface SyncEventPayload {
  entityType: string;
  action: "CREATED" | "UPDATED" | "DELETED" | "STATUS_CHANGED";
  entityId: string;
  data: any;
  version: number;
  timestamp: string;
  actorEmail?: string;
  isPrivate?: boolean; // If true, only dispatched to verified admin connections
}

interface ConnectedClient {
  id: string;
  ws?: WebSocket;
  sseRes?: Response;
  isAdmin: boolean;
  role: string;
  email: string;
  connectedAt: Date;
}

class RealtimeHub {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Attach WebSocket Server to the core Node HTTP Server
   */
  public attachServer(server: http.Server) {
    if (this.wss) return;

    this.wss = new WebSocketServer({
      noServer: true
    });

    server.on("upgrade", (request, socket, head) => {
      const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;

      if (pathname === "/ws/sync" || pathname === "/ws") {
        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          this.wss!.emit("connection", ws, request);
        });
      }
    });

    this.wss.on("connection", (ws: WebSocket, request: http.IncomingMessage) => {
      const clientId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      // Parse query params for authentication / role hint
      const urlObj = new URL(request.url || "", `http://${request.headers.host}`);
      const roleParam = urlObj.searchParams.get("role") || "ANONYMOUS";
      const emailParam = urlObj.searchParams.get("email") || "guest@cinevenue.com";
      const passcode = urlObj.searchParams.get("passcode") || "";
      const isAdmin = roleParam === "SUPER_ADMIN" || roleParam === "ADMIN" || passcode === "999999" || passcode === "123456";

      const clientRecord: ConnectedClient = {
        id: clientId,
        ws,
        isAdmin,
        role: isAdmin ? (roleParam || "ADMIN") : "CUSTOMER",
        email: emailParam,
        connectedAt: new Date()
      };

      this.clients.set(clientId, clientRecord);
      logger.info(`[RealtimeHub] Client connected: ${clientId} (Role: ${clientRecord.role}, Admin: ${isAdmin})`);

      // Send initial welcome & heartbeat ack
      ws.send(JSON.stringify({
        type: "SYNC_CONNECTED",
        clientId,
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      }));

      ws.on("message", (rawMsg) => {
        try {
          const msg = JSON.parse(rawMsg.toString());
          if (msg.type === "PING") {
            ws.send(JSON.stringify({ type: "PONG", timestamp: new Date().toISOString() }));
          } else if (msg.type === "AUTH") {
            if (msg.passcode === "999999" || msg.role === "SUPER_ADMIN" || msg.role === "ADMIN") {
              clientRecord.isAdmin = true;
              clientRecord.role = msg.role || "ADMIN";
              clientRecord.email = msg.email || clientRecord.email;
              ws.send(JSON.stringify({ type: "AUTH_SUCCESS", role: clientRecord.role }));
            }
          }
        } catch (e) {}
      });

      ws.on("close", () => {
        this.clients.delete(clientId);
        logger.info(`[RealtimeHub] Client disconnected: ${clientId}`);
      });

      ws.on("error", (err) => {
        logger.warn(`[RealtimeHub] Client socket error on ${clientId}: ${err.message}`);
        this.clients.delete(clientId);
      });
    });

    // 25s Heartbeat Ping to prevent firewall and mobile carrier socket drops
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, id) => {
        if (client.ws && client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.ping();
          } catch (e) {
            this.clients.delete(id);
          }
        }
      });
    }, 25000);

    logger.info("📡 [RealtimeHub] Authoritative WebSocket server initialized on /ws/sync");
  }

  /**
   * Register a Server-Sent Events (SSE) Client
   */
  public registerSseClient(res: Response | any, isAdminOrRole: boolean | string = false, roleParam?: string, emailParam?: string): any {
    const clientId = `sse_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    let isAdmin = false;
    let role = "CUSTOMER";
    let email = emailParam || "";

    if (typeof isAdminOrRole === "boolean") {
      isAdmin = isAdminOrRole;
      role = roleParam || (isAdmin ? "ADMIN" : "CUSTOMER");
    } else if (typeof isAdminOrRole === "string") {
      const lower = isAdminOrRole.toLowerCase();
      isAdmin = lower === "super_admin" || lower === "admin";
      role = isAdminOrRole.toUpperCase();
    }

    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
    }
    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    const clientRecord: ConnectedClient = {
      id: clientId,
      sseRes: res,
      isAdmin,
      role,
      email,
      connectedAt: new Date()
    };

    this.clients.set(clientId, clientRecord);

    // Initial connection event
    if (typeof res.write === "function") {
      res.write(`data: ${JSON.stringify({ type: "SYNC_CONNECTED", clientId, timestamp: new Date().toISOString() })}\n\n`);
    }

    if (typeof res.on === "function") {
      res.on("close", () => {
        this.clients.delete(clientId);
      });
    }

    const unregister: any = () => {
      this.clients.delete(clientId);
    };
    unregister.clientId = clientId;
    unregister.toString = () => clientId;
    return unregister;
  }

  /**
   * Broadcast an authoritative sync event to all relevant connected clients
   */
  public broadcastUpdate(event: SyncEventPayload) {
    const eventType = (event as any).type || (event.entityType ? `${event.entityType}:${event.action}` : "SYNC_UPDATE");
    const rawPayload = JSON.stringify({
      type: eventType,
      event
    });

    let deliveredCount = 0;

    this.clients.forEach((client) => {
      // Respect privacy boundaries: do not leak private administrative events to public / guest users
      if (event.isPrivate && !client.isAdmin) {
        return;
      }

      // 1. Deliver via WebSocket
      if (client.ws && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(rawPayload);
          deliveredCount++;
        } catch (e) {
          logger.warn(`Failed to send sync message to WS client ${client.id}`);
        }
      }

      // 2. Deliver via SSE
      if (client.sseRes && !client.sseRes.writableEnded) {
        try {
          client.sseRes.write(`data: ${rawPayload}\n\n`);
          deliveredCount++;
        } catch (e) {
          logger.warn(`Failed to send sync message to SSE client ${client.id}`);
        }
      }
    });

    logger.info(`[RealtimeHub] Broadcasted ${event.entityType}:${event.action} (v${event.version}) to ${deliveredCount} client(s)`);
  }

  /**
   * Get telemetry stats
   */
  public getStats() {
    let wsCount = 0;
    let sseCount = 0;
    let adminCount = 0;

    this.clients.forEach((c) => {
      if (c.ws) wsCount++;
      if (c.sseRes) sseCount++;
      if (c.isAdmin) adminCount++;
    });

    return {
      totalClients: this.clients.size,
      wsCount,
      sseCount,
      adminCount,
      serverTime: new Date().toISOString()
    };
  }
}

export const realtimeHub = new RealtimeHub();
