import { prisma } from "../../lib/prisma";

export async function createSeats(
  screenId: string,
  seats: Array<{
    row: string;
    number: string;
    category:
      | "REGULAR"
      | "PREMIUM"
      | "RECLINER"
      | "WHEELCHAIR"
      | "COUPLE";
    price: number;
  }>
) {
  const screen = await prisma.screen.findUnique({
    where: { id: screenId }
  });

  if (!screen) {
    throw new Error("Screen not found");
  }

  return prisma.$transaction(
    seats.map((seat) =>
      prisma.seat.create({
        data: {
          screenId,
          row: seat.row,
          number: seat.number,
          category: seat.category,
          price: seat.price
        }
      })
    )
  );
}

export async function updateSeat(
  id: string,
  data: {
    row?: string;
    number?: string;
    category?: any;
    price?: number;
    status?: "AVAILABLE" | "BLOCKED";
  }
) {
  return prisma.seat.update({
    where: { id },
    data
  });
}

export async function blockSeat(id: string) {
  return prisma.seat.update({
    where: { id },
    data: {
      status: "BLOCKED"
    }
  });
}

export async function unblockSeat(id: string) {
  return prisma.seat.update({
    where: { id },
    data: {
      status: "AVAILABLE"
    }
  });
}

export async function getSeatLayout(screenId: string) {
  return prisma.seat.findMany({
    where: {
      screenId
    },
    orderBy: [
      {
        row: "asc"
      },
      {
        number: "asc"
      }
    ]
  });
}
