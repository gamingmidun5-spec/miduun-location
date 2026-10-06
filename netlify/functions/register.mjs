import {
  body, json, normalizePhone, validPhone, token,
  sessionKey, inboxKey, writeJSON
} from "./_lib.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, message: "POST only" }, 405);

  const data = await body(req);
  const phone = normalizePhone(data.phone);

  if (!validPhone(phone)) {
    return json({ ok: false, message: "Nomor HP tidak valid." }, 400);
  }

  const deviceToken = token();
  const now = Date.now();

  await writeJSON(sessionKey(phone, deviceToken), {
    phone,
    deviceToken,
    createdAt: now,
    lastSeen: now
  });

  await writeJSON(inboxKey(phone, deviceToken), []);

  return json({
    ok: true,
    phone,
    deviceToken,
    message: "Perangkat berhasil didaftarkan."
  });
};
