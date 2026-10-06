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
    return json({ ok: false, message: "Lokasi belum diizinkan." }, 409);
  }

  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  const accuracy = Number(data.accuracy);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return json({ ok: false, message: "Koordinat tidak valid." }, 400);
  }

  r.location = {
    latitude,
    longitude,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
    timestamp: Date.now()
  };
  r.updatedAt = Date.now();

  await writeJSON(requestKey(id), r);

  return json({ ok: true });
};
