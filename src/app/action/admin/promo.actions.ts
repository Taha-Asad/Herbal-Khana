// app/action/admin/promo.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { ActionResponse, PromoCode, PromoCodeFormData } from "@/types/admin";

export async function getPromoCodes(): Promise<ActionResponse<PromoCode[]>> {
  try {
    await requireAdmin();

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: promoCodes.map((promo) => ({
        id: promo.id,
        code: promo.code,
        description: promo.description || undefined,
        type: promo.type,
        value: Number(promo.value),
        minOrderAmount: promo.minOrderAmount
          ? Number(promo.minOrderAmount)
          : undefined,
        maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : undefined,
        maxUses: promo.maxUses || undefined,
        maxUsesPerUser: promo.maxUsesPerUser,
        usedCount: promo.usedCount,
        isActive: promo.isActive,
        isFirstOrderOnly: promo.isFirstOrderOnly,
        startsAt: promo.startsAt?.toISOString(),
        expiresAt: promo.expiresAt?.toISOString(),
        createdAt: promo.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getPromoCodes error:", error);
    return { success: false, error: "Failed to load promo codes" };
  }
}

export async function getPromoCode(
  id: string
): Promise<ActionResponse<PromoCode>> {
  try {
    await requireAdmin();

    const promo = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!promo) {
      return { success: false, error: "Promo code not found" };
    }

    return {
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        description: promo.description || undefined,
        type: promo.type,
        value: Number(promo.value),
        minOrderAmount: promo.minOrderAmount
          ? Number(promo.minOrderAmount)
          : undefined,
        maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : undefined,
        maxUses: promo.maxUses || undefined,
        maxUsesPerUser: promo.maxUsesPerUser,
        usedCount: promo.usedCount,
        isActive: promo.isActive,
        isFirstOrderOnly: promo.isFirstOrderOnly,
        startsAt: promo.startsAt?.toISOString(),
        expiresAt: promo.expiresAt?.toISOString(),
        createdAt: promo.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("getPromoCode error:", error);
    return { success: false, error: "Failed to load promo code" };
  }
}

export async function createPromoCode(
  data: PromoCodeFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      return { success: false, error: "Promo code already exists" };
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        isActive: data.isActive,
        isFirstOrderOnly: data.isFirstOrderOnly,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    revalidatePath("/admin/promo-codes");
    return {
      success: true,
      data: { id: promo.id },
      message: "Promo code created",
    };
  } catch (error) {
    console.error("createPromoCode error:", error);
    return { success: false, error: "Failed to create promo code" };
  }
}

export async function updatePromoCode(
  id: string,
  data: Partial<PromoCodeFormData>
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Check code uniqueness if changing
    if (data.code) {
      const existing = await prisma.promoCode.findFirst({
        where: { code: data.code.toUpperCase(), id: { not: id } },
      });
      if (existing) {
        return { success: false, error: "Promo code already exists" };
      }
    }

    const updateData: Prisma.PromoCodeUpdateInput = {};

    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.minOrderAmount !== undefined)
      updateData.minOrderAmount = data.minOrderAmount;
    if (data.maxDiscount !== undefined)
      updateData.maxDiscount = data.maxDiscount;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
    if (data.maxUsesPerUser !== undefined)
      updateData.maxUsesPerUser = data.maxUsesPerUser;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFirstOrderOnly !== undefined)
      updateData.isFirstOrderOnly = data.isFirstOrderOnly;
    if (data.startsAt !== undefined)
      updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.expiresAt !== undefined)
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    await prisma.promoCode.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/promo-codes");
    return { success: true, message: "Promo code updated" };
  } catch (error) {
    console.error("updatePromoCode error:", error);
    return { success: false, error: "Failed to update promo code" };
  }
}

export async function deletePromoCode(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.promoCode.delete({ where: { id } });

    revalidatePath("/admin/promo-codes");
    return { success: true, message: "Promo code deleted" };
  } catch (error) {
    console.error("deletePromoCode error:", error);
    return { success: false, error: "Failed to delete promo code" };
  }
}

export async function togglePromoStatus(
  id: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.promoCode.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
  } catch (error) {
    console.error("togglePromoStatus error:", error);
    return { success: false, error: "Failed to update promo status" };
  }
}
