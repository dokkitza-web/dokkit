import assert from "node:assert/strict";
import test from "node:test";
import {
  createFreeChecklistToken,
  FREE_CHECKLIST_TOKEN_TTL_SECONDS,
  verifyFreeChecklistToken,
} from "../src/lib/free-checklist-downloads";

test("free checklist download tokens are signed, scoped and expire", () => {
  const previousSecret = process.env.DOWNLOAD_TOKEN_ENCRYPTION_KEY;
  process.env.DOWNLOAD_TOKEN_ENCRYPTION_KEY = "test-free-checklist-secret";

  try {
    const now = Date.UTC(2026, 6, 29, 12, 0, 0);
    const token = createFreeChecklistToken({
      leadId: "5b2be3d8-4c68-4306-a9a9-e4b3a2cbf0f8",
      format: "pdf",
      now,
    });
    const payload = verifyFreeChecklistToken(token, now);

    assert.equal(payload?.leadId, "5b2be3d8-4c68-4306-a9a9-e4b3a2cbf0f8");
    assert.equal(payload?.format, "pdf");
    assert.equal(
      payload?.expiresAt,
      Math.floor(now / 1000) + FREE_CHECKLIST_TOKEN_TTL_SECONDS,
    );
    assert.equal(
      verifyFreeChecklistToken(
        token,
        now + (FREE_CHECKLIST_TOKEN_TTL_SECONDS + 1) * 1000,
      ),
      null,
    );
    assert.equal(verifyFreeChecklistToken(`${token}changed`, now), null);
  } finally {
    if (previousSecret) {
      process.env.DOWNLOAD_TOKEN_ENCRYPTION_KEY = previousSecret;
    } else {
      delete process.env.DOWNLOAD_TOKEN_ENCRYPTION_KEY;
    }
  }
});
