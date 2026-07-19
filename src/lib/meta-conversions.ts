type MetaUserData = {
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
};

type MetaCustomData = {
  currency?: string;
  value?: number;
  contentIds?: string[];
  contentName?: string;
  contentType?: string;
  contents?: {
    id: string;
    quantity: number;
    itemPrice: number;
  }[];
};

type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

function compactObject(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export async function sendMetaConversionEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData,
  customData = {},
}: {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  userData: MetaUserData;
  customData?: MetaCustomData;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN?.trim();
  const graphApiVersion =
    process.env.META_GRAPH_API_VERSION?.trim() || "v26.0";

  if (!pixelId || !accessToken) {
    return { sent: false, reason: "not_configured" } as const;
  }

  const normalisedUserData = compactObject({
    client_ip_address: userData.clientIpAddress,
    client_user_agent: userData.clientUserAgent,
    fbp: userData.fbp,
    fbc: userData.fbc,
  });

  if (!Object.keys(normalisedUserData).length) {
    return { sent: false, reason: "missing_user_data" } as const;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: normalisedUserData,
        custom_data: compactObject({
          currency: customData.currency,
          value: customData.value,
          content_ids: customData.contentIds,
          content_name: customData.contentName,
          content_type: customData.contentType,
          contents: customData.contents?.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            item_price: item.itemPrice,
          })),
        }),
      },
    ],
  };
  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const response = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(
      graphApiVersion,
    )}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(
      accessToken,
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Meta Conversions API returned ${response.status}.`);
  }

  return { sent: true } as const;
}
