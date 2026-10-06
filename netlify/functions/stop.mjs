import {
  body, json, normalizePhone, requireSession,
  requestKey, readJSON, writeJSON
} from "./_lib.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, message: "POST only" }, 405);

  const data = await body(req);
  const phone = normalizePhone(data.phone);
  const deviceToken = String(data.deviceToken || "");
  const id = String(data.requestId || "");

  const session = await requireSession(phone, deviceToken);
  if (!session) return json({ ok: false, message: "Sesi tidak aktif." }, 401);

  const r = await readJSON(requestKey(id));
  if (!r) return json({ ok: false, message: "Permintaan tidak ditemukan." }, 404);

  if (r.targetPhone !== phone || r.targetToken !== deviceToken) {
    return json({ ok: false, message: "Permintaan bukan milik perangkat ini." }, 403);
  }

  if (r.status !== "allowed") {
    return json({ ok: false, message: "Sesi berbagi lokasi tidak aktif." }, 409);
  }

  r.status = "stopped";
  r.updatedAt = Date.now();
  await writeJSON(requestKey(id), r);

  return json({ ok: true, message: "Berbagi lokasi dihentikan." });
};
