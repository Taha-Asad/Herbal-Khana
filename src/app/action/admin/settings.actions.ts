// app/action/admin/settings.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin-auth";
import {
  ActionResponse,
  ShippingMethod,
  ShippingMethodFormData,
} from "@/types/admin";

// ============================================================================
// SHIPPING METHODS
// ============================================================================

export async function getShippingMethods(): Promise<
  ActionResponse<ShippingMethod[]>
> {
  try {
    await requireAdmin();

    const methods = await prisma.shippingMethod.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return {
      success: true,
      data: methods.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || undefined,
        price: Number(m.price),
        freeAbove: m.freeAbove ? Number(m.freeAbove) : undefined,
        estimatedDays: m.estimatedDays,
        isActive: m.isActive,
        sortOrder: m.sortOrder,
      })),
    };
  } catch (error) {
    console.error("getShippingMethods error:", error);
    return { success: false, error: "Failed to load shipping methods" };
  }
}

export async function createShippingMethod(
  data: ShippingMethodFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const method = await prisma.shippingMethod.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        freeAbove: data.freeAbove,
        estimatedDays: data.estimatedDays,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      data: { id: method.id },
      message: "Shipping method created",
    };
  } catch (error) {
    console.error("createShippingMethod error:", error);
    return { success: false, error: "Failed to create shipping method" };
  }
}

export async function updateShippingMethod(
  id: string,
  data: Partial<ShippingMethodFormData>
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.shippingMethod.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Shipping method updated" };
  } catch (error) {
    console.error("updateShippingMethod error:", error);
    return { success: false, error: "Failed to update shipping method" };
  }
}

export async function deleteShippingMethod(
  id: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Check if any orders use this shipping method
    const ordersCount = await prisma.order.count({
      where: { shippingMethodId: id },
    });

    if (ordersCount > 0) {
      return {
        success: false,
        error: `Cannot delete: ${ordersCount} orders use this shipping method`,
      };
    }

    await prisma.shippingMethod.delete({ where: { id } });

    revalidatePath("/admin/settings");
    return { success: true, message: "Shipping method deleted" };
  } catch (error) {
    console.error("deleteShippingMethod error:", error);
    return { success: false, error: "Failed to delete shipping method" };
  }
}

export async function reorderShippingMethods(
  orderedIds: string[]
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.shippingMethod.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("reorderShippingMethods error:", error);
    return { success: false, error: "Failed to reorder shipping methods" };
  }
}

// ============================================================================
// STORE SETTINGS
// ============================================================================

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  taxRate: number;
  enableReviews: boolean;
  enableGuestCheckout: boolean;
  lowStockThreshold: number;
  orderPrefix: string;
}

export async function getStoreSettings(): Promise<
  ActionResponse<StoreSettings>
> {
  try {
    await requireAdmin();

    const settings = await prisma.setting.findMany();
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const getValue = <T>(key: string, defaultValue: T): T => {
      const value = settingsMap.get(key);
      if (value === undefined || value === null) return defaultValue;
      return value as T;
    };

    return {
      success: true,
      data: {
        storeName: getValue("storeName", "My Store"),
        storeEmail: getValue("storeEmail", ""),
        storePhone: getValue("storePhone", ""),
        storeAddress: getValue("storeAddress", ""),
        currency: getValue("currency", "PKR"),
        taxRate: getValue("taxRate", 0),
        enableReviews: getValue("enableReviews", true),
        enableGuestCheckout: getValue("enableGuestCheckout", false),
        lowStockThreshold: getValue("lowStockThreshold", 5),
        orderPrefix: getValue("orderPrefix", "ORD"),
      },
    };
  } catch (error) {
    console.error("getStoreSettings error:", error);
    return { success: false, error: "Failed to load settings" };
  }
}

export async function updateStoreSettings(
  data: Partial<StoreSettings>
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const entries = Object.entries(data);

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value: value as Prisma.InputJsonValue },
          update: { value: value as Prisma.InputJsonValue },
        })
      )
    );

    revalidatePath("/admin/settings");
    return { success: true, message: "Settings updated" };
  } catch (error) {
    console.error("updateStoreSettings error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
