# CINEVENUE — STAGING POS ARCHITECTURE & HARDWARE ADAPTER REPORT

**Component:** Cinema Point-of-Sale (POS) & Box Office Hardware Integration  
**Module Location:** [`server/modules/pos/`](../../server/modules/pos/)  
**Supported Adapters:** Vista Cinema, TicketNew, Generic POS Adapter  
**Status Breakdown:**
* **POS Adapter Source Inspection:** **VERIFIED**
* **Mock-Level Adapter & QR Validation Tests:** **VERIFIED IN UNIT TESTS**
* **Physical Hardware Testing (Printers / Scanners / Turnstiles):** **PENDING PHYSICAL HARDWARE**  

---

## 1. POS ARCHITECTURE & ADAPTER FACTORY

The CineVenue POS subsystem abstracts box-office and kiosk operations behind a unified interface:

```
[ Box Office Terminal / Kiosk ]
              │
              ▼
    [ POS API Router ] ─── server/modules/pos/pos.routes.ts
              │
              ▼
    [ PosAdapterFactory ] ─── server/modules/pos/pos.adapter.factory.ts
              │
       ┌──────┼──────────────────────┐
       ▼      ▼                      ▼
  [ Vista ] [ TicketNew ]   [ Generic Adapter ] (Local Fallback)
```

### Supported Provider Adapters:
1. **Generic POS Adapter ([`generic.adapter.ts`](../../server/modules/pos/adapters/generic.adapter.ts)):** In-memory and local database adapter providing full POS capabilities (seat locks, sales, receipt formatting, ticket validation) without requiring external vendor software.
2. **Vista Cinema Adapter ([`vista.adapter.ts`](../../server/modules/pos/adapters/vista.adapter.ts)):** Enterprise integration connecting to Vista Connect APIs for synchronized ticketing, concession sales, and loyalty.
3. **TicketNew Adapter ([`ticketnew.adapter.ts`](../../server/modules/pos/adapters/ticketnew.adapter.ts)):** Regional cinema aggregator protocol adapter.

---

## 2. CORE POS CAPABILITIES VERIFIED IN CODE

* **POS Authentication & Encryption:** Box-office terminals authenticate via dedicated POS tokens with HMAC payload validation (`pos.encryption.ts`).
* **Inventory Synchronization:** Bidirectional seat hold synchronization between the online CineVenue platform and box-office terminals prevents double-booking.
* **Ticket Sales & Receipt Data:** Supports cash, card, and UPI sales at the counter with formatted thermal receipt generation.
* **QR Gate Validation:** Gate turnstiles and handheld usher scanners validate tickets via atomic check-in logic (`ticketVerification.test.ts`), flagging duplicated or invalid tokens immediately.
* **Offline Resilience:** Terminal queues local transactions when the Internet connection drops, synchronizing automatically when connectivity is restored.

---

## 3. PHYSICAL HARDWARE COMPATIBILITY SPECIFICATION

For cinema box-office and kiosk installations, the following hardware profiles are supported:

| Hardware Category | Recommended Models / Standards | Interface Protocol | Staging Verification Status |
| :--- | :--- | :--- | :---: |
| **Receipt Printers** | Epson TM-T88VI, Star Micronics TSP143III, Bixolon SRP-350 | ESC/POS via USB, Ethernet LAN (TCP/IP 9100), or Bluetooth | **PENDING — PHYSICAL HARDWARE** |
| **Ticket Printers** | Boca Systems Lemur, Citizen CL-S400DT (Fanfold thermal tickets) | FGL / ESC/POS via USB or Ethernet | **PENDING — PHYSICAL HARDWARE** |
| **QR & Barcode Scanners** | Zebra DS2208, Honeywell Xenon 1900, Newland HR2081 | USB HID Keyboard Emulation or Virtual COM port | **PENDING — PHYSICAL HARDWARE** |
| **Turnstiles / Access Gates** | CAME, Gunnebo, Boon Edam barcode turnstiles | Dry-contact relay output / TCP/IP gate controller | **PENDING — PHYSICAL HARDWARE** |
| **Terminal Hardware** | Windows 10/11 IoT Enterprise POS, Sunmi T2s / D2s Android POS | Modern web browser (Chrome 120+) or Electron shell | **PENDING — PHYSICAL HARDWARE** |

---

## 4. HARDWARE AUDIT BOUNDARY & COMPLIANCE

* **Zero Mocking of Real Equipment:** The application does not claim physical hardware verification in the absence of physical devices.
* **Non-Destructive Execution:** The software makes zero connections to live theater box-office networks during automated tests.
* **Staging Verification:** The `GenericPosAdapter` provides complete functional verification in staging without requiring physical peripherals.

