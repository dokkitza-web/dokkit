import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCESS_REISSUE_SUPPORT_SECONDS,
  ORDER_ACCESS_TTL_SECONDS,
  ORDER_DOWNLOAD_LIMIT,
  createOrderAccessCookieName,
  createOrderAccessToken,
  getOrderAccessTokenFromRequest,
  hashDownloadToken,
  verifyOrderAccessToken,
} from "../src/lib/downloads";

test("download policy constants match the approved operating rules", () => {
  assert.equal(ORDER_ACCESS_TTL_SECONDS, 7 * 24 * 60 * 60);
  assert.equal(ORDER_DOWNLOAD_LIMIT, 5);
  assert.equal(ACCESS_REISSUE_SUPPORT_SECONDS, 365 * 24 * 60 * 60);
});

test("order access codes are unguessable and verified by hash", () => {
  const first = createOrderAccessToken();
  const second = createOrderAccessToken();
  const storedHash = hashDownloadToken(first);

  assert.notEqual(first, second);
  assert.ok(first.length >= 20);
  assert.equal(
    verifyOrderAccessToken({ suppliedToken: first, storedHash }),
    true,
  );
  assert.equal(
    verifyOrderAccessToken({ suppliedToken: second, storedHash }),
    false,
  );
});

test("order access uses a scoped HttpOnly-cookie name instead of a URL token", () => {
  const orderNumber = "DK-20260727-ABC12345";
  const cookieName = createOrderAccessCookieName(orderNumber);
  const request = new Request("https://dokkit.co.za/api/orders/status", {
    headers: { cookie: `${cookieName}=secure-code-value` },
  });

  assert.equal(cookieName, createOrderAccessCookieName(orderNumber));
  assert.equal(
    getOrderAccessTokenFromRequest(request, orderNumber),
    "secure-code-value",
  );
});
