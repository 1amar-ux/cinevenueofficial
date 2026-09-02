import { prisma } from "../../lib/prisma";

export async function createScreen(
  theatreId: string,
  data: {
    name: string;
    capacity: number;
    status?: "ACTIVE" | "INACTIVE";
  }
) {
  const theatre = await prisma.theatre.findUnique({
    where: { id: theatreId }
  });

  if (!theatre) {
    throw new Error("Theatre not found");
  }

  return prisma.screen.create({
    data: {
      theatreId,
      name: data.name,
      capacity: data.capacity,
      status: data.status || "ACTIVE"
    }
  });
}

export async function updateScreen(
  id: string,
  data: {
    name?: string;
    capacity?: number;
    status?: "ACTIVE" | "INACTIVE";
  }
) {
  return prisma.screen.update({
    where: { id },
    data
  });
}

export async function getScreens(theatreId: string) {
  return prisma.screen.findMany({
    where: {
      theatreId
    },
    include: {
      seats: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function getScreen(id: string) {
  return prisma.screen.findUnique({
    where: { id },
    include: {
      seats: true
    }
  });
}
