import { IPosProviderAdapter } from "./pos.types";
import { GenericPosAdapter } from "./adapters/generic.adapter";
import { VistaPosAdapter } from "./adapters/vista.adapter";
import { TicketNewPosAdapter } from "./adapters/ticketnew.adapter";

export class PosAdapterFactory {
  private static adapters: Map<string, IPosProviderAdapter> = new Map();

  public static getAdapter(providerName?: string): IPosProviderAdapter {
    const normalized = (providerName || "").trim().toLowerCase();

    if (normalized.includes("vista")) {
      if (!this.adapters.has("vista")) {
        this.adapters.set("vista", new VistaPosAdapter());
      }
      return this.adapters.get("vista")!;
    }

    if (normalized.includes("ticketnew") || normalized.includes("ticket_new")) {
      if (!this.adapters.has("ticketnew")) {
        this.adapters.set("ticketnew", new TicketNewPosAdapter());
      }
      return this.adapters.get("ticketnew")!;
    }

    if (!this.adapters.has("generic")) {
      this.adapters.set("generic", new GenericPosAdapter());
    }
    return this.adapters.get("generic")!;
  }
}
