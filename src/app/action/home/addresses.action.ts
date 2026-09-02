// lib/actions/addresses.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { Address, AddressInput, ActionResponse } from "@/types/account";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().max(50).optional(),
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  line1: z.string().min(5).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  postal: z.string().min(4).max(10),
  country: z.string().default("Pakistan"),
  isDefault: z.boolean().optional(),
});

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get all addresses
 */
export async function getAddresses(): Promise<ActionResponse<Address[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      data: addresses as Address[],
    };
  } catch (error) {
    console.error("Failed to get addresses:", error);
    return { success: false, error: "Failed to load addresses" };
  }
}

/**
 * Get single address
 */
export async function getAddress(
  addressId: string
): Promise<ActionResponse<Address>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return { success: false, error: "Address not found" };
    }

    return { success: true, data: address as Address };
  } catch (error) {
    console.error("Failed to get address:", error);
    return { success: false, error: "Failed to load address" };
  }
}

/**
 * Create new address
 */
export async function createAddress(
  input: AddressInput
): Promise<ActionResponse<Address>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = addressSchema.parse(input);

    // If this is the first address or marked as default, update others
    if (validated.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is the first address
    const existingCount = await prisma.address.count({ where: { userId } });
    const isFirst = existingCount === 0;

    const address = await prisma.address.create({
      data: {
        userId,
        ...validated,
        isDefault: isFirst || validated.isDefault || false,
      },
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      data: address as Address,
      message: "Address added successfully",
    };
  } catch (error) {
    console.error("Failed to create address:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to add address" };
  }
}

/**
 * Update address
 */
export async function updateAddress(
  addressId: string,
  input: AddressInput
): Promise<ActionResponse<Address>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = addressSchema.parse(input);

    // Check ownership
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      return { success: false, error: "Address not found" };
    }

    // If setting as default, unset others
    if (validated.isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: validated,
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      data: address as Address,
      message: "Address updated successfully",
    };
  } catch (error) {
    console.error("Failed to update address:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update address" };
  }
}

/**
 * Delete address
 */
export async function deleteAddress(
  addressId: string
): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return { success: false, error: "Address not found" };
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/account/addresses");

    return { success: true, message: "Address deleted successfully" };
  } catch (error) {
    console.error("Failed to delete address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

/**
 * Set address as default
 */
export async function setDefaultAddress(
  addressId: string
): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Check ownership
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Update all addresses
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/account/addresses");

    return { success: true, message: "Default address updated" };
  } catch (error) {
    console.error("Failed to set default address:", error);
    return { success: false, error: "Failed to update default address" };
  }
}

/**
 * Get default address
 */
export async function getDefaultAddress(): Promise<
  ActionResponse<Address | null>
> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const address = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    return { success: true, data: address as Address | null };
  } catch (error) {
    console.error("Failed to get default address:", error);
    return { success: false, error: "Failed to load default address" };
  }
}
