import {
  body, json, normalizePhone, validPhone, requireSession,
  phoneHash, store, requestKey, inboxKey, writeJSON, requestId
} from "./_lib.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, message: "POST only" }, 405);

  const data = await body(req);
  const requesterPhone = normalizePhone(data.requesterPhone);
  const requesterToken = String(data.requesterToken || "");
  const targetPhone = normalizePhone(data.targetPhone);

  if (!validPhone(requesterPhone) || !validPhone(targetPhone)) {
    return json({ ok: false, message: "Nomor HP tidak valid." }, 400);
  }

  if (requesterPhone === targetPhone) {
    return json({ ok: false, message: "Nomor target harus berbeda." }, 400);
  }

  const requester = await requireSession(requesterPhone, requesterToken);
  if (!requester) {
    return json({ ok: false, message: "Sesi peminta tidak aktif. Daftarkan ulang perangkat." }, 401);
  }

  // Cari session target yang masih aktif.
  const prefix = `sessions/${phoneHash(targetPhone)}/`;
  const listed = await store.list({ prefix });
  const active = [];

  for (const item of listed.blobs || []) {
    const session = await store.get(item.key, { type: "json", consistency: "strong" });
    if (!session) continue;
    if (Date.now() - Number(session.lastSeen || 0) <= 60_000) {
      active.push(session);
    }
  }

  if (!active.length) {
    return json({
      ok: false,
      message: "Target belum online. Minta target membuka halaman dan mendaftarkan nomornya terlebih dahulu."
    }, 404);
  }

  active.sort((a, b) => Number(b.lastSeen) - Number(a.lastSeen));
  const target = active[0];

  const id = requestId();
  const now = Date.now();

  const reqData = {
    id,
    requesterPhone,
    requesterToken,
    targetPhone,
    targetToken: target.deviceToken,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    location: null
  };

  await writeJSON(requestKey(id), reqData);

  const ikey = inboxKey(targetPhone, target.deviceToken);
  const inbox = (await store.get(ikey, { type: "json", consistency: "strong" })) || [];
  inbox.push(id);

  // Batasi inbox demo agar tidak tumbuh tanpa batas.
  const trimmed = inbox.slice(-30);
  await writeJSON(ikey, trimmed);

  return json({
    ok: true,
    requestId: id,
    message: "Permintaan lokasi dikirim. Menunggu persetujuan target."
  });
};
