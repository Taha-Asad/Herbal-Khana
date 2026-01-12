// app/api/checkout/validate/route.ts
import { getServerAuthSession } from "@/app/action/home/user.action";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cartId } = body;

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          where: { isSavedForLater: false },
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });
    if (!cart || cart.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    if (cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate stock for each item
    const stockIssues: string[] = [];

    for (const item of cart.items) {
      if (!item.variant.product.isActive) {
        stockIssues.push(`${item.variant.product.name} is no longer available`);
      } else if (item.variant.stock < item.quantity) {
        if (item.variant.stock === 0) {
          stockIssues.push(
            `${item.variant.product.name} - ${item.variant.name} is out of stock`
          );
        } else {
          stockIssues.push(
            `Only ${item.variant.stock} units available for ${item.variant.product.name} - ${item.variant.name}`
          );
        }
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Some items have stock issues",
        issues: stockIssues,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cart is valid for checkout",
    });
  } catch (error) {
    console.error("Error validating checkout:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
