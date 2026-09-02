import { getServerAuthSession } from "@/app/action/home/user.action";
import { uploadPaymentProof } from "@/app/action/home/payment.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = await uploadPaymentProof({
      orderId,
      transactionId: body.transactionId,
      senderName: body.senderName,
      senderPhone: body.senderPhone,
      proofImageUrl: body.proofImageUrl,
      notes: body.notes,
    });

    if (result.success) {
      return NextResponse.json(result);
    }

    return NextResponse.json(result, { status: 400 });
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
