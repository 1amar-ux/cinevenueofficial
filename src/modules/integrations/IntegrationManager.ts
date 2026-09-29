import { POSIntegration } from "./interfaces/CinemaAdapter";
import { MockPosAdapter } from "./adapters/MockPosAdapter";
import { VistaConnectAdapter } from "./adapters/VistaConnectAdapter";
import { VeeziPosAdapter } from "./adapters/VeeziPosAdapter";
import { GenericRestPosAdapter } from "./adapters/GenericRestPosAdapter";
import { NativeTheatreAdapter } from "./adapters/NativeTheatreAdapter";
import { PvrInoxAdapter } from "./adapters/PvrInoxAdapter";
import { EventVenueAdapter } from "./adapters/EventVenueAdapter";

export class IntegrationManager {
  private static instance: IntegrationManager;
  private adapters: Map<string, POSIntegration> = new Map();
  private theatreAdapters: Map<string, POSIntegration> = new Map();

  private constructor() {
    this.registerAdapter("MOCK", new MockPosAdapter());
    this.registerAdapter("MOCK_POS", new MockPosAdapter());
    this.registerAdapter("VISTA", new VistaConnectAdapter());
    this.registerAdapter("VEEZI", new VeeziPosAdapter());
    this.registerAdapter("REST_POS", new GenericRestPosAdapter());
    this.registerAdapter("GENERIC_REST", new GenericRestPosAdapter());
    this.registerAdapter("GENERIC", new GenericRestPosAdapter());
    this.registerAdapter("PVR_INOX", new PvrInoxAdapter() as any);
    this.registerAdapter("NATIVE", new NativeTheatreAdapter() as any);
    this.registerAdapter("EVENT_VENUE", new EventVenueAdapter() as any);
  }

  public static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager();
    }
    return IntegrationManager.instance;
  }

  public registerAdapter(key: string, adapter: POSIntegration) {
    this.adapters.set(key.toUpperCase(), adapter);
  }

  public registerTheatreAdapter(theatreId: string, adapter: POSIntegration) {
    this.theatreAdapters.set(theatreId, adapter);
  }

  public getAdapter(key: string = "MOCK"): POSIntegration {
    const norm = (key || "").toUpperCase().replace(/\s+/g, "_");
    if (norm.includes("VISTA")) return this.adapters.get("VISTA") || this.adapters.get("MOCK")!;
    if (norm.includes("VEEZI")) return this.adapters.get("VEEZI") || this.adapters.get("MOCK")!;
    if (norm.includes("REST") || norm.includes("GENERIC")) return this.adapters.get("REST_POS") || this.adapters.get("MOCK")!;
    if (norm.includes("MOCK") || norm.includes("SANDBOX")) return this.adapters.get("MOCK")!;

    return this.adapters.get(norm) || this.adapters.get("MOCK")!;
  }

  public getAdapterForTheatre(theatreId: string, fallbackProvider?: string): POSIntegration {
    if (this.theatreAdapters.has(theatreId)) {
      return this.theatreAdapters.get(theatreId)!;
    }
    return this.getAdapter(fallbackProvider || "MOCK");
  }

  public getAllAdapters(): POSIntegration[] {
    return Array.from(this.adapters.values());
  }
}

export const integrationManager = IntegrationManager.getInstance();
