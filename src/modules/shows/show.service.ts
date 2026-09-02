import { prisma } from "../../lib/prisma";

export async function createShow(data: {
  theatreId: string;
  screenId: string;
  movieId?: string;
  eventId?: string;
  startTime: string;
  endTime: string;
  language?: string;
  format?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const screen = await tx.screen.findFirst({
      where: {
        id: data.screenId,
        theatreId: data.theatreId
      },
      include: {
        seats: true
      }
    });

    if (!screen) {
      throw new Error("Screen does not belong to theatre");
    }

    const show = await tx.show.create({
      data: {
        theatreId: data.theatreId,
        screenId: data.screenId,
        movieId: data.movieId,
        eventId: data.eventId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        language: data.language,
        format: data.format
      }
    });

    // Automatically generate ShowSeat records for the entire screen layout
    if (screen.seats && screen.seats.length > 0) {
      await tx.showSeat.createMany({
        data: screen.seats.map((seat: any) => ({
          showId: show.id,
          seatId: seat.id,
          price: seat.price,
          status: seat.status === "BLOCKED" ? "BLOCKED" : "AVAILABLE"
        }))
      });
    }

    return show;
  });
}

export async function updateShow(
  id: string,
  data: {
    movieId?: string;
    eventId?: string;
    startTime?: string;
    endTime?: string;
    language?: string;
    format?: string;
    status?: "ACTIVE" | "CANCELLED" | "COMPLETED";
  }
) {
  return prisma.show.update({
    where: { id },
    data: {
      ...data,
      ...(data.startTime ? { startTime: new Date(data.startTime) } : {}),
      ...(data.endTime ? { endTime: new Date(data.endTime) } : {})
    }
  });
}

export async function getShows(params: {
  theatreId?: string;
  movieId?: string;
  date?: string;
}) {
  return prisma.show.findMany({
    where: {
      ...(params.theatreId ? { theatreId: params.theatreId } : {}),
      ...(params.movieId ? { movieId: params.movieId } : {}),
      ...(params.date
        ? {
            startTime: {
              gte: new Date(`${params.date}T00:00:00`),
              lt: new Date(`${params.date}T23:59:59`)
            }
          }
        : {})
    },
    include: {
      theatre: true,
      screen: true
    },
    orderBy: {
      startTime: "asc"
    }
  });
}

export async function getShow(id: string) {
  return prisma.show.findUnique({
    where: { id },
    include: {
      theatre: true,
      screen: true
    }
  });
}
