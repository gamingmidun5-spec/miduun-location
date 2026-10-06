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
  const decision = String(data.decision || "");

  if (!["allowed", "denied"].includes(decision)) {
    return json({ ok: false, message: "Keputusan tidak valid." }, 400);
  }

  const session = await requireSession(phone, deviceToken);
  if (!session) return json({ ok: false, message: "Sesi tidak aktif." }, 401);

  const r = await readJSON(requestKey(id));
  if (!r) return json({ ok: false, message: "Permintaan tidak ditemukan." }, 404);

  if (r.targetPhone !== phone || r.targetToken !== deviceToken) {
    return json({ ok: false, message: "Permintaan bukan milik perangkat ini." }, 403);
  }

  if (r.status !== "pending") {
    return json({ ok: false, message: "Permintaan sudah diproses." }, 409);
  }

  r.status = decision;
  r.updatedAt = Date.now();

  if (decision === "denied") {
    r.location = null;
  }

  await writeJSON(requestKey(id), r);

  return json({
    ok: true,
    status: r.status,
    message: decision === "allowed"
      ? "Akses lokasi diizinkan. Silakan izinkan GPS pada browser."
      : "Permintaan lokasi ditolak."
  });
};
