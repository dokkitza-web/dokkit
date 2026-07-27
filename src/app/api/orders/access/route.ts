import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createOrderAccessCookieName,
  verifyOrderAccessToken,
} from "@/lib/downloads";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const accessSchema = z.object({
  orderNumber: z.string().trim().min(1).max(40),
  accessCode: z.string().trim().min(20).max(200),
});

export async function POST(request: Request) {
  const parsedBody = accessSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "The order number or secure access code is invalid." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "order_number,download_access_token_hash,access_expires_at,status",
    )
    .eq("order_number", parsedBody.data.orderNumber)
    .maybeSingle();

  if (
    error ||
    !order ||
    !verifyOrderAccessToken({
      suppliedToken: parsedBody.data.accessCode,
      storedHash: order.download_access_token_hash,
    })
  ) {
    return NextResponse.json(
      { error: "The order number or secure access code is invalid." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    accepted: true,
    status: order.status,
  });
  const expiresAt = order.access_expires_at
    ? new Date(order.access_expires_at)
    : new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
  const maxAge = Math.max(
    Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    60,
  );

  response.cookies.set(
    createOrderAccessCookieName(order.order_number),
    parsedBody.data.accessCode,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    },
  );

  return response;
}
