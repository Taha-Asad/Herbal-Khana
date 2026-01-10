// app/api/orders/[orderId]/payment-proof/route.ts
import { getServerAuthSession } from "@/app/action/orders.action";
import { uploadPaymentProof } from "@/app/action/payment.action";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { orderId: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = await uploadPaymentProof({
      orderId: params.orderId,
      transactionId: body.transactionId,
      senderName: body.senderName,
      senderPhone: body.senderPhone,
      proofImageUrl: body.proofImageUrl,
      notes: body.notes,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
