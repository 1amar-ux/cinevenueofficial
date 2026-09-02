import { prisma } from "../../lib/prisma";

export async function createTheatre(data: {
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}) {
  return prisma.theatre.create({
    data: {
      ...data,
      status: data.status || "INACTIVE"
    }
  });
}

export async function updateTheatre(
  id: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
  }
) {
  return prisma.theatre.update({
    where: { id },
    data
  });
}

export async function getTheatre(id: string) {
  return prisma.theatre.findUnique({
    where: { id },
    include: {
      screens: true
    }
  });
}

export async function getTheatres(params?: { city?: string; status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" }) {
  return prisma.theatre.findMany({
    where: {
      ...(params?.city ? { city: params.city } : {}),
      ...(params?.status ? { status: params.status } : {})
    }
  });
}

export async function updateTheatreStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
) {
  return prisma.theatre.update({
    where: { id },
    data: { status }
  });
}
