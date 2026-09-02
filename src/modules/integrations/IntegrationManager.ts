import { CinemaAdapter } from "./interfaces/CinemaAdapter";
import { NativeTheatreAdapter } from "./adapters/NativeTheatreAdapter";
import { PvrInoxAdapter } from "./adapters/PvrInoxAdapter";
import { EventVenueAdapter } from "./adapters/EventVenueAdapter";

export class IntegrationManager {
  private static instance: IntegrationManager;
  private adapters: Map<string, CinemaAdapter> = new Map();

  private constructor() {
    this.registerAdapter("NATIVE", new NativeTheatreAdapter());
    this.registerAdapter("PVR_INOX", new PvrInoxAdapter());
    this.registerAdapter("EVENT_VENUE", new EventVenueAdapter());
  }

  public static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager();
    }
    return IntegrationManager.instance;
  }

  public registerAdapter(key: string, adapter: CinemaAdapter) {
    this.adapters.set(key.toUpperCase(), adapter);
  }

  public getAdapter(key: string = "NATIVE"): CinemaAdapter {
    const adapter = this.adapters.get(key.toUpperCase()) || this.adapters.get("NATIVE");
    if (!adapter) {
      throw new Error(`Cinema adapter for '${key}' not found.`);
    }
    return adapter;
  }

  public getAllAdapters(): CinemaAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const integrationManager = IntegrationManager.getInstance();
