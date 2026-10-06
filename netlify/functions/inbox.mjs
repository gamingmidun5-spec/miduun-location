import {
  json, normalizePhone, requireSession, inboxKey,
  requestKey, readJSON, writeJSON
} from "./_lib.mjs";

export default async (req) => {
  if (req.method !== "GET") return json({ ok: false, message: "GET only" }, 405);

  const url = new URL(req.url);
  const phone = normalizePhone(url.searchParams.get("phone"));
  const deviceToken = String(url.searchParams.get("deviceToken") || "");

  const session = await requireSession(phone, deviceToken);
  if (!session) {
    return json({ ok: false, message: "Sesi tidak aktif." }, 401);
  }

  const key = inboxKey(phone, deviceToken);
  const ids = (await readJSON(key)) || [];
  const requests = [];
  const keep = [];

  for (const id of ids) {
    const r = await readJSON(requestKey(id));
    if (!r) continue;

    if (r.targetToken !== deviceToken || r.targetPhone !== phone) continue;

    if (r.status === "pending") {
      requests.push({
        id: r.id,
        requesterPhone: r.requesterPhone,
        createdAt: r.createdAt
      });
      keep.push(id);
    }
  }

  await writeJSON(key, keep);

  return json({ ok: true, requests });
};
