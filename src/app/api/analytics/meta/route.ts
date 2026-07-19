import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";

export const runtime = "nodejs";

const metaEventSchema = z.object({
  eventName: z.enum([
    "PageView",
    "ViewContent",
    "AddToCart",
    "InitiateCheckout",
  ]),
  eventId: z.string().trim().min(8).max(160),
  eventSourceUrl: z.string().url().max(500),
  customData: z
    .object({
      currency: z.string().trim().length(3).optional(),
      value: z.number().nonnegative().max(10_000_000).optional(),
      content_ids: z.array(z.string().trim().min(1).max(160)).max(50).optional(),
      content_name: z.string().trim().max(250).optional(),
      content_type: z.string().trim().max(50).optional(),
      contents: z
        .array(
          z.object({
            id: z.string().trim().min(1).max(160),
            quantity: z.number().int().min(1).max(50),
            item_price: z.number().nonnegative().max(10_000_000),
          }),
        )
        .max(50)
        .optional(),
    })
    .optional()
    .default({}),
});

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

function hasAllowedOrigin(request: Request, eventSourceUrl: string) {
  const requestOrigin = new URL(request.url).origin;
  const eventOrigin = new URL(eventSourceUrl).origin;
  const browserOrigin = request.headers.get("origin");

  return (
    eventOrigin === requestOrigin &&
    (!browserOrigin || browserOrigin === requestOrigin)
  );
}

export async function POST(request: Request) {
  const parsedBody = metaEventSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const { eventName, eventId, eventSourceUrl, customData } = parsedBody.data;

  if (!hasAllowedOrigin(request, eventSourceUrl)) {
    return NextResponse.json({ accepted: false }, { status: 403 });
  }

  try {
    const result = await sendMetaConversionEvent({
      eventName,
      eventId,
      eventSourceUrl,
      userData: {
        clientIpAddress: getClientIp(request),
        clientUserAgent: request.headers.get("user-agent") ?? undefined,
        fbp: request.headers
          .get("cookie")
          ?.match(/(?:^|;\s*)_fbp=([^;]+)/)?.[1],
        fbc: request.headers
          .get("cookie")
          ?.match(/(?:^|;\s*)_fbc=([^;]+)/)?.[1],
      },
      customData: {
        currency: customData.currency,
        value: customData.value,
        contentIds: customData.content_ids,
        contentName: customData.content_name,
        contentType: customData.content_type,
        contents: customData.contents?.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          itemPrice: item.item_price,
        })),
      },
    });

    return NextResponse.json(
      { accepted: true, sent: result.sent },
      { status: result.sent ? 200 : 202 },
    );
  } catch (error) {
    console.warn(
      "Meta browser conversion event was not sent.",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({ accepted: true, sent: false }, { status: 202 });
  }
}
