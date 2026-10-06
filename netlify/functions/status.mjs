import {
  json, normalizePhone, requireSession,
  requestKey, readJSON
} from "./_lib.mjs";

export default async (req) => {
  if (req.method !== "GET") return json({ ok: false, message: "GET only" }, 405);

  const url = new URL(req.url);
  const phone = normalizePhone(url.searchParams.get("phone"));
  const deviceToken = String(url.searchParams.get("deviceToken") || "");
  const id = String(url.searchParams.get("requestId") || "");

  const session = await requireSession(phone, deviceToken);
  if (!session) return json({ ok: false, message: "Sesi tidak aktif." }, 401);

  const r = await readJSON(requestKey(id));
  if (!r) return json({ ok: false, message: "Permintaan tidak ditemukan." }, 404);

  if (r.requesterPhone !== phone || r.requesterToken !== deviceToken) {
    return json({ ok: false, message: "Permintaan bukan milik perangkat ini." }, 403);
  }

  return json({
    ok: true,
    id: r.id,
    targetPhone: r.targetPhone,
    status: r.status,
    location: r.location || null,
    updatedAt: r.updatedAt
  });
};
