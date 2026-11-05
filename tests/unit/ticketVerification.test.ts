import { 
  generateSecureTicketToken, 
  generateIndividualSeatTickets, 
  getTicketVerificationUrl 
} from "../../src/utils/ticketDeliveryService";

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runTicketVerificationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
    }
  };

  runTest("1. Multi-Ticket: Unique QR tokens generated for multiple seats", () => {
    const bookingId = "BK-829104";
    const seats = ["A1", "A2", "A3"];
    const tickets = generateIndividualSeatTickets(bookingId, seats, "PRIME");

    if (tickets.length !== 3) {
      throw new Error(`Expected 3 tickets, received ${tickets.length}`);
    }

    const tokens = new Set(tickets.map((t) => t.qrToken));
    if (tokens.size !== 3) {
      throw new Error("QR tokens for individual seats must all be distinct and unique");
    }

    const codes = new Set(tickets.map((t) => t.ticketCode));
    if (codes.size !== 3) {
      throw new Error("Ticket codes for individual seats must all be distinct and unique");
    }

    if (!tickets[0].qrToken.includes("A1") || !tickets[1].qrToken.includes("A2")) {
      throw new Error("QR tokens must reference individual seat identifiers");
    }
  });

  runTest("2. Zero Sensitive Information Exposure in QR Tokens", () => {
    const bookingId = "BK-991283";
    const token = generateSecureTicketToken(bookingId, 1, "E4");

    if (token.includes("card") || token.includes("cvv") || token.includes("password") || token.includes("@")) {
      throw new Error("QR tokens must never embed sensitive card details or emails");
    }

    const verifyUrl = getTicketVerificationUrl(token);
    if (!verifyUrl.includes("/verify-ticket?token=")) {
      throw new Error("Verification URL must route to /verify-ticket endpoint");
    }
  });

  runTest("3. Single Seat / General Admission Fallback", () => {
    const bookingId = "BK-442190";
    const tickets = generateIndividualSeatTickets(bookingId, []);

    if (tickets.length !== 1) {
      throw new Error(`Expected fallback single ticket, received ${tickets.length}`);
    }

    if (tickets[0].status !== "VALID") {
      throw new Error("Initial status of newly generated ticket must be VALID");
    }
  });

  runTest("4. Simulated Gate Verification & Atomic Seat Check-in Logic", () => {
    const usedSeats = new Set<string>();

    const checkInSeat = (seat: string): "VALID" | "ALREADY_USED" => {
      if (usedSeats.has(seat)) {
        return "ALREADY_USED";
      }
      usedSeats.add(seat);
      return "VALID";
    };

    // First scan for Seat A1 -> VALID
    const scan1 = checkInSeat("A1");
    if (scan1 !== "VALID") {
      throw new Error(`Expected scan 1 for A1 to be VALID, got ${scan1}`);
    }

    // Second scan for Seat A1 -> ALREADY_USED
    const scan2 = checkInSeat("A1");
    if (scan2 !== "ALREADY_USED") {
      throw new Error(`Expected duplicate scan 2 for A1 to be ALREADY_USED, got ${scan2}`);
    }

    // First scan for Seat A2 -> VALID (different seat in same booking is not blocked)
    const scan3 = checkInSeat("A2");
    if (scan3 !== "VALID") {
      throw new Error(`Expected scan for A2 to be VALID, got ${scan3}`);
    }
  });

  return results;
}

