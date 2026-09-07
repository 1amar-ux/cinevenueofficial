import Decimal from "decimal.js";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { logger } from "../../shared/logger";
import { encryptSecret, decryptSecret, generateWebhookSecret, maskSecret } from "./pos.encryption";
import { PosAdapterFactory } from "./pos.adapter.factory";
import {
  PosCapabilities,
  PosConnectionTestResult,
  PosSeatHoldRequest,
  PosSeatHoldResponse,
  PosBookingRequest,
  PosBookingResponse
} from "./pos.types";

export class PosIntegrationService {
  /**
   * Helper: Resolves decrypted configuration for an integration record
   */
  private getDecryptedConfig(integration: any) {
    return {
      integrationId: integration.id,
      theatreId: integration.theatreId,
      providerName: integration.providerName,
      environment: integration.environment,
      baseApiUrl: integration.baseApiUrl,
      venueId: integration.venueId,
      terminalId: integration.terminalId,
      apiKey: decryptSecret(integration.encryptedApiKey),
      apiSecret: decryptSecret(integration.encryptedApiSecret),
      clientId: decryptSecret(integration.encryptedClientId || ""),
      clientSecret: decryptSecret(integration.encryptedClientSecret || ""),
      accessToken: decryptSecret(integration.encryptedAccessToken || ""),
      merchantId: integration.merchantId,
      webhookSecret: decryptSecret(integration.encryptedWebhookSecret || "")
    };
  }

  /**
   * Log an integration event safely
   */
  public async logEvent(data: {
    integrationId: string;
    event: string;
    requestType: string;
    endpoint: string;
    statusCode: number;
    durationMs: number;
    status: "SUCCESS" | "ERROR" | "FAILED";
    bookingId?: string;
    posBookingId?: string;
    error?: string;
  }) {
    try {
      await prisma.posIntegrationLog.create({
        data: {
          integrationId: data.integrationId,
          event: data.event,
          requestType: data.requestType,
          endpoint: data.endpoint,
          statusCode: data.statusCode,
          durationMs: data.durationMs,
          status: data.status,
          bookingId: data.bookingId,
          posBookingId: data.posBookingId,
          error: data.error ? String(data.error).slice(0, 500) : null
        }
      });
    } catch (err: any) {
      logger.warn(`Failed to write POS integration log: ${err.message}`);
    }
  }

  /**
   * 1. Get or Create POS Integration for a Theatre
   */
  public async getOrCreateIntegration(theatreId: string) {
    const theatre = await prisma.theatre.findUnique({ where: { id: theatreId } });
    if (!theatre) throw new Error(`Theatre with ID ${theatreId} not found`);

    let integration = await prisma.theatrePosIntegration.findUnique({
      where: { theatreId },
      include: { mappings: true }
    });

    if (!integration) {
      const webhookSecret = generateWebhookSecret();
      integration = await prisma.theatrePosIntegration.create({
        data: {
          theatreId,
          theatreName: theatre.name,
          integrationType: "POS_INTEGRATION",
          providerName: "Vista",
          environment: "SANDBOX",
          baseApiUrl: "https://api-sandbox.vista.co/v1",
          encryptedApiKey: encryptSecret("sample_sandbox_key"),
          encryptedApiSecret: encryptSecret("sample_sandbox_secret"),
          webhookUrl: `https://cinevenue.com/api/v1/webhooks/pos/${theatreId}`,
          encryptedWebhookSecret: encryptSecret(webhookSecret),
          connectionStatus: "TESTING",
          capabilities: {
            showSync: "NOT_TESTED",
            screenSync: "NOT_TESTED",
            seatLayout: "NOT_TESTED",
            liveSeatAvailability: "NOT_TESTED",
            seatHold: "NOT_TESTED",
            releaseSeatHold: "NOT_TESTED",
            bookingConfirmation: "NOT_TESTED",
            bookingStatus: "NOT_TESTED",
            cancellation: "NOT_TESTED",
            refund: "NOT_TESTED",
            webhooks: "NOT_TESTED"
          }
        },
        include: { mappings: true }
      });
    }

    return {
      ...integration,
      maskedApiKey: maskSecret(decryptSecret(integration.encryptedApiKey)),
      maskedApiSecret: maskSecret(decryptSecret(integration.encryptedApiSecret)),
      webhookSecretPreview: decryptSecret(integration.encryptedWebhookSecret)
    };
  }

  /**
   * 2. Save / Update POS Configuration
   */
  public async saveConfiguration(theatreId: string, data: {
    theatreName?: string;
    integrationType?: string;
    providerName: string;
    environment: "SANDBOX" | "PRODUCTION";
    baseApiUrl: string;
    venueId?: string;
    terminalId?: string;
    apiKey?: string;
    apiSecret?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    merchantId?: string;
    seatHoldDurationMinutes?: number;
    syncFrequency?: string;
  }) {
    let existing = await prisma.theatrePosIntegration.findUnique({ where: { theatreId } });
    const webhookUrl = `https://cinevenue.com/api/v1/webhooks/pos/${theatreId}`;
    const webhookSecret = existing ? decryptSecret(existing.encryptedWebhookSecret) : generateWebhookSecret();

    // Update Theatre integrationType
    await prisma.theatre.update({
      where: { id: theatreId },
      data: {
        integrationType: data.integrationType || "POS_INTEGRATION",
        ...(data.theatreName && { name: data.theatreName })
      }
    });

    const updatePayload: any = {
      theatreName: data.theatreName || existing?.theatreName || "Theatre",
      integrationType: data.integrationType || "POS_INTEGRATION",
      providerName: data.providerName,
      environment: data.environment,
      baseApiUrl: data.baseApiUrl,
      venueId: data.venueId || null,
      terminalId: data.terminalId || null,
      merchantId: data.merchantId || null,
      webhookUrl,
      encryptedWebhookSecret: encryptSecret(webhookSecret),
      ...(data.seatHoldDurationMinutes && { seatHoldDurationMinutes: data.seatHoldDurationMinutes }),
      ...(data.syncFrequency && { syncFrequency: data.syncFrequency })
    };

    if (data.apiKey) updatePayload.encryptedApiKey = encryptSecret(data.apiKey);
    if (data.apiSecret) updatePayload.encryptedApiSecret = encryptSecret(data.apiSecret);
    if (data.clientId) updatePayload.encryptedClientId = encryptSecret(data.clientId);
    if (data.clientSecret) updatePayload.encryptedClientSecret = encryptSecret(data.clientSecret);
    if (data.accessToken) updatePayload.encryptedAccessToken = encryptSecret(data.accessToken);

    const integration = await prisma.theatrePosIntegration.upsert({
      where: { theatreId },
      update: updatePayload,
      create: {
        theatreId,
        encryptedApiKey: encryptSecret(data.apiKey || "sample_key"),
        encryptedApiSecret: encryptSecret(data.apiSecret || "sample_secret"),
        ...updatePayload
      }
    });

    return {
      ...integration,
      maskedApiKey: maskSecret(decryptSecret(integration.encryptedApiKey)),
      maskedApiSecret: maskSecret(decryptSecret(integration.encryptedApiSecret)),
      webhookSecretPreview: webhookSecret
    };
  }

  /**
   * 3. Regenerate Webhook Secret
   */
  public async regenerateWebhookSecret(integrationId: string) {
    const newSecret = generateWebhookSecret();
    const updated = await prisma.theatrePosIntegration.update({
      where: { id: integrationId },
      data: {
        encryptedWebhookSecret: encryptSecret(newSecret)
      }
    });
    return {
      webhookUrl: updated.webhookUrl,
      webhookSecret: newSecret
    };
  }

  /**
   * 4. Test Connection & Capability Detection
   */
  public async testConnection(integrationId: string): Promise<PosConnectionTestResult> {
    const integration = await prisma.theatrePosIntegration.findUnique({ where: { id: integrationId } });
    if (!integration) throw new Error("Integration not found");

    const decryptedConfig = this.getDecryptedConfig(integration);
    const adapter = PosAdapterFactory.getAdapter(integration.providerName);

    const startTime = Date.now();
    let result: PosConnectionTestResult;

    try {
      result = await adapter.testConnection(decryptedConfig);
      const durationMs = Date.now() - startTime;

      await prisma.theatrePosIntegration.update({
        where: { id: integrationId },
        data: {
          connectionStatus: result.connected ? "CONNECTED" : "FAILED",
          capabilities: result.capabilities as any,
          lastConnectionTest: new Date(),
          lastError: result.error || null
        }
      });

      await this.logEvent({
        integrationId,
        event: "API_CONNECTION",
        requestType: "GET",
        endpoint: `${decryptedConfig.baseApiUrl}/health`,
        statusCode: result.connected ? 200 : 502,
        durationMs,
        status: result.connected ? "SUCCESS" : "FAILED",
        error: result.error
      });

      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      await prisma.theatrePosIntegration.update({
        where: { id: integrationId },
        data: {
          connectionStatus: "FAILED",
          lastConnectionTest: new Date(),
          lastError: err.message
        }
      });

      await this.logEvent({
        integrationId,
        event: "API_CONNECTION",
        requestType: "GET",
        endpoint: `${decryptedConfig.baseApiUrl}/health`,
        statusCode: 500,
        durationMs,
        status: "ERROR",
        error: err.message
      });

      return {
        connected: false,
        provider: integration.providerName,
        environment: integration.environment as any,
        latencyMs: durationMs,
        apiStatus: "ERROR",
        error: err.message,
        capabilities: {
          showSync: "NOT_TESTED",
          screenSync: "NOT_TESTED",
          seatLayout: "NOT_TESTED",
          liveSeatAvailability: "NOT_TESTED",
          seatHold: "NOT_TESTED",
          releaseSeatHold: "NOT_TESTED",
          bookingConfirmation: "NOT_TESTED",
          bookingStatus: "NOT_TESTED",
          cancellation: "NOT_TESTED",
          refund: "NOT_TESTED",
          webhooks: "NOT_TESTED"
        }
      };
    }
  }

  /**
   * 5. Sync Now — Synchronize Movies, Screens, Shows, and Seat Layouts
   */
  public async syncData(integrationId: string) {
    const integration = await prisma.theatrePosIntegration.findUnique({
      where: { id: integrationId },
      include: { theatre: true }
    });
    if (!integration) throw new Error("Integration not found");

    const config = this.getDecryptedConfig(integration);
    const adapter = PosAdapterFactory.getAdapter(integration.providerName);
    const startTime = Date.now();

    await prisma.theatrePosIntegration.update({
      where: { id: integrationId },
      data: { syncStatus: "SYNCING" }
    });

    let recordsCreated = 0;
    let recordsUpdated = 0;

    try {
      // A. Sync Screens
      const posScreens = await adapter.getScreens(config, integration.venueId || undefined);
      for (const pScr of posScreens) {
        let cineScreen = await prisma.screen.findFirst({
          where: { theatreId: integration.theatreId, name: pScr.name }
        });

        if (!cineScreen) {
          cineScreen = await prisma.screen.create({
            data: {
              theatreId: integration.theatreId,
              name: pScr.name,
              capacity: pScr.capacity || 150
            }
          });
          recordsCreated++;
        }

        await prisma.posMapping.upsert({
          where: {
            integrationId_mappingType_posId: {
              integrationId,
              mappingType: "SCREEN",
              posId: pScr.posScreenId
            }
          },
          update: {
            posName: pScr.name,
            cinevenueId: cineScreen.id,
            cinevenueName: cineScreen.name,
            status: "MAPPED"
          },
          create: {
            integrationId,
            mappingType: "SCREEN",
            posId: pScr.posScreenId,
            posName: pScr.name,
            cinevenueId: cineScreen.id,
            cinevenueName: cineScreen.name,
            status: "MAPPED"
          }
        });
      }

      // B. Sync Movies
      const posMovies = await adapter.getMovies(config);
      for (const pMov of posMovies) {
        let cineMovie = await prisma.movie.findFirst({
          where: { title: { equals: pMov.title, mode: "insensitive" } }
        });

        if (!cineMovie) {
          cineMovie = await prisma.movie.create({
            data: {
              title: pMov.title,
              duration: pMov.durationMinutes || 150,
              languages: pMov.language ? [pMov.language] : ["Telugu"],
              formats: pMov.format ? [pMov.format] : ["2D"],
              status: "NOW_SHOWING"
            }
          });
          recordsCreated++;
        }

        await prisma.posMapping.upsert({
          where: {
            integrationId_mappingType_posId: {
              integrationId,
              mappingType: "MOVIE",
              posId: pMov.posMovieId
            }
          },
          update: {
            posName: pMov.title,
            cinevenueId: cineMovie.id,
            cinevenueName: cineMovie.title,
            status: "MAPPED"
          },
          create: {
            integrationId,
            mappingType: "MOVIE",
            posId: pMov.posMovieId,
            posName: pMov.title,
            cinevenueId: cineMovie.id,
            cinevenueName: cineMovie.title,
            status: "MAPPED"
          }
        });
      }

      // C. Sync Shows
      const posShows = await adapter.getShows(config, integration.venueId || undefined);
      for (const pShow of posShows) {
        // Map dependencies
        const screenMap = await prisma.posMapping.findFirst({
          where: { integrationId, mappingType: "SCREEN", posId: pShow.posScreenId }
        });
        const movieMap = await prisma.posMapping.findFirst({
          where: { integrationId, mappingType: "MOVIE", posId: pShow.posMovieId }
        });

        if (screenMap && movieMap) {
          const startTimeDate = new Date(pShow.showTime);
          const endTimeDate = pShow.endTime ? new Date(pShow.endTime) : new Date(startTimeDate.getTime() + 150 * 60 * 1000);

          let show = await prisma.show.findFirst({
            where: {
              theatreId: integration.theatreId,
              screenId: screenMap.cinevenueId,
              movieId: movieMap.cinevenueId,
              startTime: startTimeDate
            }
          });

          const basePrice = pShow.categories?.[0]?.price || 200;

          if (!show) {
            show = await prisma.show.create({
              data: {
                theatreId: integration.theatreId,
                screenId: screenMap.cinevenueId,
                movieId: movieMap.cinevenueId,
                startTime: startTimeDate,
                endTime: endTimeDate,
                price: new Decimal(basePrice),
                status: "SCHEDULED"
              }
            });
            recordsCreated++;
          } else {
            recordsUpdated++;
          }

          await prisma.posMapping.upsert({
            where: {
              integrationId_mappingType_posId: {
                integrationId,
                mappingType: "SHOW",
                posId: pShow.posShowId
              }
            },
            update: {
              posName: `${movieMap.cinevenueName} - ${startTimeDate.toLocaleTimeString()}`,
              cinevenueId: show.id,
              cinevenueName: `${movieMap.cinevenueName} (${screenMap.cinevenueName})`,
              status: "MAPPED"
            },
            create: {
              integrationId,
              mappingType: "SHOW",
              posId: pShow.posShowId,
              posName: `${movieMap.cinevenueName} - ${startTimeDate.toLocaleTimeString()}`,
              cinevenueId: show.id,
              cinevenueName: `${movieMap.cinevenueName} (${screenMap.cinevenueName})`,
              status: "MAPPED"
            }
          });
        }
      }

      await prisma.theatrePosIntegration.update({
        where: { id: integrationId },
        data: {
          lastSync: new Date(),
          syncStatus: "SUCCESS",
          lastError: null
        }
      });

      await this.logEvent({
        integrationId,
        event: "SHOW_SYNC",
        requestType: "GET",
        endpoint: "/sync",
        statusCode: 200,
        durationMs: Date.now() - startTime,
        status: "SUCCESS"
      });

      return {
        success: true,
        recordsCreated,
        recordsUpdated,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      await prisma.theatrePosIntegration.update({
        where: { id: integrationId },
        data: {
          syncStatus: "ERROR",
          lastError: err.message
        }
      });

      await this.logEvent({
        integrationId,
        event: "SHOW_SYNC",
        requestType: "GET",
        endpoint: "/sync",
        statusCode: 500,
        durationMs: Date.now() - startTime,
        status: "ERROR",
        error: err.message
      });

      throw err;
    }
  }

  /**
   * 6. Live Real-Time Seat Availability Check
   */
  public async getLiveSeatAvailability(theatreId: string, showId: string) {
    const integration = await prisma.theatrePosIntegration.findUnique({ where: { theatreId } });
    if (!integration) return null;

    const config = this.getDecryptedConfig(integration);
    const adapter = PosAdapterFactory.getAdapter(integration.providerName);

    // Find mapped POS Show ID
    const showMap = await prisma.posMapping.findFirst({
      where: { integrationId: integration.id, mappingType: "SHOW", cinevenueId: showId }
    });
    const posShowId = showMap?.posId || showId;

    try {
      const availability = await adapter.getSeatAvailability(config, posShowId);
      return availability;
    } catch (err: any) {
      logger.warn(`POS live availability error for show ${showId}: ${err.message}`);
      return null;
    }
  }

  /**
   * 7. Real-Time Seat Hold (2–15 Minutes Lock)
   */
  public async holdSeats(theatreId: string, showId: string, seatIds: string[], userId: string): Promise<PosSeatHoldResponse> {
    const integration = await prisma.theatrePosIntegration.findUnique({ where: { theatreId } });
    if (!integration) {
      return {
        success: true,
        posHoldId: `LOCAL_HOLD_${Date.now()}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        heldSeatIds: seatIds
      };
    }

    const config = this.getDecryptedConfig(integration);
    const adapter = PosAdapterFactory.getAdapter(integration.providerName);

    const showMap = await prisma.posMapping.findFirst({
      where: { integrationId: integration.id, mappingType: "SHOW", cinevenueId: showId }
    });
    const posShowId = showMap?.posId || showId;

    const holdRequest: PosSeatHoldRequest = {
      posShowId,
      posSeatIds: seatIds,
      durationMinutes: integration.seatHoldDurationMinutes || 10,
      customerIdentifier: userId,
      idempotencyKey: `HOLD-${showId}-${seatIds.sort().join("-")}-${Date.now()}`
    };

    const startTime = Date.now();
    try {
      const res = await adapter.holdSeats(config, holdRequest);
      await this.logEvent({
        integrationId: integration.id,
        event: "SEAT_HOLD",
        requestType: "POST",
        endpoint: "/shows/hold",
        statusCode: res.success ? 200 : 409,
        durationMs: Date.now() - startTime,
        status: res.success ? "SUCCESS" : "FAILED",
        error: res.error
      });
      return res;
    } catch (err: any) {
      await this.logEvent({
        integrationId: integration.id,
        event: "SEAT_HOLD",
        requestType: "POST",
        endpoint: "/shows/hold",
        statusCode: 500,
        durationMs: Date.now() - startTime,
        status: "ERROR",
        error: err.message
      });
      throw err;
    }
  }

  /**
   * 8. Release Seat Hold
   */
  public async releaseSeats(theatreId: string, showId: string, posHoldId: string, seatIds: string[]) {
    const integration = await prisma.theatrePosIntegration.findUnique({ where: { theatreId } });
    if (!integration) return true;

    const config = this.getDecryptedConfig(integration);
    const adapter = PosAdapterFactory.getAdapter(integration.providerName);

    const showMap = await prisma.posMapping.findFirst({
      where: { integrationId: integration.id, mappingType: "SHOW", cinevenueId: showId }
    });
    const posShowId = showMap?.posId || showId;

    return adapter.releaseSeats(config, posShowId, posHoldId, seatIds);
  }

  /**
   * 9. Confirm Booking in Theatre POS with Idempotency & Payment Safety
   */
  public async confirmBookingInPos(bookingId: string): Promise<PosBookingResponse> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        theatre: { include: { posIntegration: true } },
        show: { include: { movie: true } },
        items: { include: { showSeat: { include: { seat: true } } } },
        user: true
      }
    });

    if (!booking) throw new Error("Booking not found");
    const integration = booking.theatre?.posIntegration;

    if (!integration || integration.integrationType !== "POS_INTEGRATION") {
      return {
        success: true,
        posBookingId: `CV_LOCAL_${booking.bookingNumber}`,
        status: "CONFIRMED"
      };
    }

    const config = this.getDecryptedConfig(integration);
    const adapter = PosAdapterFactory.getAdapter(integration.providerName);

    const showMap = await prisma.posMapping.findFirst({
      where: { integrationId: integration.id, mappingType: "SHOW", cinevenueId: booking.showId }
    });

    const posSeatIds = booking.items.map(i => `${i.showSeat.seat.row}${i.showSeat.seat.number}`);

    const bookingRequest: PosBookingRequest = {
      idempotencyKey: `CINEVENUE-${booking.id}`,
      cinevenueBookingId: booking.bookingNumber,
      posShowId: showMap?.posId || booking.showId,
      posHoldId: booking.posHoldId || undefined,
      posSeatIds,
      totalTicketAmount: Number(booking.ticketAmount),
      customerDetails: {
        name: booking.user?.name || "Customer",
        email: booking.user?.email || "customer@cinevenue.com",
        mobile: booking.user?.mobile || ""
      }
    };

    const startTime = Date.now();
    try {
      const posRes = await adapter.createBooking(config, bookingRequest);

      if (posRes.success && posRes.status === "CONFIRMED") {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            posBookingId: posRes.posBookingId,
            posReferenceNumber: posRes.posReferenceNumber,
            posStatus: "CONFIRMED"
          }
        });

        await prisma.theatrePosIntegration.update({
          where: { id: integration.id },
          data: { lastSuccessfulBooking: new Date() }
        });

        await this.logEvent({
          integrationId: integration.id,
          event: "BOOKING",
          requestType: "POST",
          endpoint: "/bookings",
          statusCode: 200,
          durationMs: Date.now() - startTime,
          status: "SUCCESS",
          bookingId: booking.bookingNumber,
          posBookingId: posRes.posBookingId
        });
      } else {
        // POS returned pending or failed status after payment
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            posStatus: "PAYMENT_RECEIVED_BOOKING_PENDING"
          }
        });

        await this.logEvent({
          integrationId: integration.id,
          event: "BOOKING",
          requestType: "POST",
          endpoint: "/bookings",
          statusCode: 502,
          durationMs: Date.now() - startTime,
          status: "FAILED",
          bookingId: booking.bookingNumber,
          error: posRes.error || "POS confirmation pending"
        });
      }

      return posRes;
    } catch (err: any) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          posStatus: "PAYMENT_RECEIVED_BOOKING_PENDING"
        }
      });

      await this.logEvent({
        integrationId: integration.id,
        event: "BOOKING",
        requestType: "POST",
        endpoint: "/bookings",
        statusCode: 500,
        durationMs: Date.now() - startTime,
        status: "ERROR",
        bookingId: booking.bookingNumber,
        error: err.message
      });

      return {
        success: false,
        posBookingId: "",
        status: "PENDING",
        error: `POS confirmation error: ${err.message}`
      };
    }
  }

  /**
   * 10. Process Webhook Event with Idempotency Guard
   */
  public async processWebhook(integrationId: string, payload: any, signatureHeader?: string) {
    const integration = await prisma.theatrePosIntegration.findUnique({ where: { id: integrationId } });
    if (!integration) throw new Error("Integration not found");

    const config = this.getDecryptedConfig(integration);
    const adapter = PosAdapterFactory.getAdapter(integration.providerName);

    const parsed = await adapter.handleWebhook(payload, signatureHeader, config.webhookSecret);

    // Check Idempotency
    const existing = await prisma.posWebhookEvent.findUnique({
      where: { eventId: parsed.eventId }
    });

    if (existing && existing.processed) {
      return { success: true, duplicate: true, message: "Webhook already processed" };
    }

    const webhookRecord = await prisma.posWebhookEvent.upsert({
      where: { eventId: parsed.eventId },
      update: { status: "PROCESSING" },
      create: {
        integrationId,
        eventId: parsed.eventId,
        eventType: parsed.eventType,
        payload: payload as any,
        signatureValid: parsed.signatureValid,
        status: "PROCESSING"
      }
    });

    try {
      // Dispatch Event
      switch (parsed.eventType) {
        case "SEAT_SOLD":
        case "SEAT_BLOCKED":
          // Invalidate local Redis seat lock cache for the show
          if (parsed.data?.showId) {
            await redis.del(`show:${parsed.data.showId}:availability`);
          }
          break;
        case "SHOW_CREATED":
        case "SHOW_UPDATED":
          // Trigger light show sync
          await this.syncData(integrationId).catch(() => {});
          break;
        default:
          break;
      }

      await prisma.posWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          processed: true,
          status: "PROCESSED",
          processedAt: new Date()
        }
      });

      await this.logEvent({
        integrationId,
        event: "WEBHOOK",
        requestType: "POST",
        endpoint: `/webhooks/pos/${integrationId}`,
        statusCode: 200,
        durationMs: 25,
        status: "SUCCESS"
      });

      return { success: true, eventId: parsed.eventId, eventType: parsed.eventType };
    } catch (err: any) {
      await prisma.posWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          status: "FAILED",
          error: err.message
        }
      });
      throw err;
    }
  }

  /**
   * 11. Run Booking Reconciliation
   */
  public async runReconciliation(integrationId: string) {
    const integration = await prisma.theatrePosIntegration.findUnique({ where: { id: integrationId } });
    if (!integration) throw new Error("Integration not found");

    const cineBookings = await prisma.booking.findMany({
      where: { theatreId: integration.theatreId },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    let matched = 0;
    let mismatches: any[] = [];

    for (const b of cineBookings) {
      if (b.posBookingId && b.posStatus === "CONFIRMED") {
        matched++;
      } else if (b.status === "CONFIRMED" && (!b.posBookingId || b.posStatus !== "CONFIRMED")) {
        mismatches.push({
          cinevenueBookingId: b.bookingNumber,
          posBookingId: b.posBookingId || "MISSING",
          issue: "Confirmed in CineVenue but missing/pending in POS",
          amount: Number(b.totalAmount),
          status: b.status
        });
      }
    }

    const record = await prisma.posReconciliationRecord.create({
      data: {
        integrationId,
        totalCinevenueBookings: cineBookings.length,
        totalPosBookings: matched,
        matchedCount: matched,
        mismatchCount: mismatches.length,
        discrepancies: mismatches as any,
        status: "COMPLETED"
      }
    });

    return {
      reconciliationId: record.id,
      totalCinevenue: cineBookings.length,
      totalPos: matched,
      matched,
      mismatches: mismatches.length,
      discrepancies: mismatches
    };
  }

  /**
   * 12. Toggle Live Booking
   */
  public async toggleLiveBooking(integrationId: string, enable: boolean) {
    return prisma.theatrePosIntegration.update({
      where: { id: integrationId },
      data: {
        liveBookingEnabled: enable,
        connectionStatus: enable ? "CONNECTED" : "SUSPENDED"
      }
    });
  }

  /**
   * 13. Cancel Booking in POS with Automatic Status Transition
   */
  public async cancelBookingInPos(bookingId: string, reason?: string) {
    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
      include: {
        theatre: { include: { posIntegration: true } }
      }
    });

    if (!booking) throw new Error("Booking not found");

    const pos = booking.theatre?.posIntegration;
    if (!pos || !booking.posBookingId) {
      // Native cancellation
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED", posStatus: "CANCELLED" }
      });
      return { success: true, posCancelled: false, refundAmount: Number(booking.totalAmount) };
    }

    const config = this.getDecryptedConfig(pos);
    const adapter = PosAdapterFactory.getAdapter(pos.providerName);

    const startTime = Date.now();
    try {
      const res = await adapter.cancelBooking(config, booking.posBookingId, reason);
      await this.logEvent({
        integrationId: pos.id,
        event: "CANCELLATION",
        requestType: "POST",
        endpoint: "/bookings/cancel",
        statusCode: res.success ? 200 : 400,
        durationMs: Date.now() - startTime,
        status: res.success ? "SUCCESS" : "FAILED",
        bookingId: booking.bookingNumber,
        posBookingId: booking.posBookingId,
        error: res.error
      });

      if (res.success) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED", posStatus: "CANCELLED" }
        });
      }

      return {
        ...res,
        refundAmount: Number(booking.totalAmount)
      };
    } catch (err: any) {
      await this.logEvent({
        integrationId: pos.id,
        event: "CANCELLATION",
        requestType: "POST",
        endpoint: "/bookings/cancel",
        statusCode: 500,
        durationMs: Date.now() - startTime,
        status: "ERROR",
        bookingId: booking.bookingNumber,
        posBookingId: booking.posBookingId,
        error: err.message
      });
      throw err;
    }
  }
}

export const posIntegrationService = new PosIntegrationService();

