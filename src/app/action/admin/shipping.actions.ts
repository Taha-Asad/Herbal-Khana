// app/action/admin/shipping.actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  rate: number;
  freeShippingThreshold: number | null;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ShippingZoneFormData {
  name: string;
  regions: string[];
  rate: number;
  freeShippingThreshold?: number | null;
  estimatedDays: string;
  isActive: boolean;
  sortOrder?: number;
}

export async function getShippingZones() {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return {
      success: true,
      data: zones.map((zone) => ({
        ...zone,
        regions: zone.regions as string[],
        createdAt: zone.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Get shipping zones error:", error);
    return { success: false, error: "Failed to fetch shipping zones" };
  }
}

export async function getShippingZone(id: string) {
  try {
    const zone = await prisma.shippingZone.findUnique({
      where: { id },
    });

    if (!zone) {
      return { success: false, error: "Shipping zone not found" };
    }

    return {
      success: true,
      data: {
        ...zone,
        regions: zone.regions as string[],
        createdAt: zone.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Get shipping zone error:", error);
    return { success: false, error: "Failed to fetch shipping zone" };
  }
}

export async function createShippingZone(data: ShippingZoneFormData) {
  try {
    const zone = await prisma.shippingZone.create({
      data: {
        name: data.name,
        regions: data.regions,
        rate: data.rate,
        freeShippingThreshold: data.freeShippingThreshold || null,
        estimatedDays: data.estimatedDays,
        isActive: data.isActive,
        sortOrder: data.sortOrder || 0,
      },
    });

    revalidatePath("/admin/shipping");
    return { success: true, data: zone };
  } catch (error) {
    console.error("Create shipping zone error:", error);
    return { success: false, error: "Failed to create shipping zone" };
  }
}

export async function updateShippingZone(
  id: string,
  data: Partial<ShippingZoneFormData>
) {
  try {
    const zone = await prisma.shippingZone.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.regions && { regions: data.regions }),
        ...(data.rate !== undefined && { rate: data.rate }),
        ...(data.freeShippingThreshold !== undefined && {
          freeShippingThreshold: data.freeShippingThreshold,
        }),
        ...(data.estimatedDays && { estimatedDays: data.estimatedDays }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    revalidatePath("/admin/shipping");
    return { success: true, data: zone };
  } catch (error) {
    console.error("Update shipping zone error:", error);
    return { success: false, error: "Failed to update shipping zone" };
  }
}

export async function deleteShippingZone(id: string) {
  try {
    await prisma.shippingZone.delete({
      where: { id },
    });

    revalidatePath("/admin/shipping");
    return { success: true };
  } catch (error) {
    console.error("Delete shipping zone error:", error);
    return { success: false, error: "Failed to delete shipping zone" };
  }
}

export async function getShippingStats() {
  try {
    const [totalZones, activeZones] = await Promise.all([
      prisma.shippingZone.count(),
      prisma.shippingZone.count({ where: { isActive: true } }),
    ]);

    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      select: { rate: true, freeShippingThreshold: true },
    });

    const avgRate =
      zones.length > 0
        ? zones.reduce((sum, z) => sum + z.rate, 0) / zones.length
        : 0;

    const freeShippingZones = zones.filter(
      (z) => z.freeShippingThreshold !== null
    ).length;

    return {
      success: true,
      data: {
        totalZones,
        activeZones,
        averageRate: Math.round(avgRate),
        freeShippingZones,
      },
    };
  } catch (error) {
    console.error("Get shipping stats error:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
