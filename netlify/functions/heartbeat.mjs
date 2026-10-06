import {
  body, json, normalizePhone, requireSession,
  sessionKey, writeJSON
} from "./_lib.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, message: "POST only" }, 405);

  const data = await body(req);
  const phone = normalizePhone(data.phone);
  const deviceToken = String(data.deviceToken || "");
  const session = await requireSession(phone, deviceToken);

  if (!session) {
    return json({ ok: false, message: "Sesi tidak ditemukan atau sudah offline." }, 401);
  }

  session.lastSeen = Date.now();
  await writeJSON(sessionKey(phone, deviceToken), session);

  return json({ ok: true, lastSeen: session.lastSeen });
};
