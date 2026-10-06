import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const store = getStore({
  name: "miduun-location-demo",
  consistency: "strong",
});

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function body(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export function normalizePhone(value) {
  let p = String(value ?? "").trim().replace(/[^\d+]/g, "");
  if (p.startsWith("08")) p = "+62" + p.slice(1);
  if (p.startsWith("62")) p = "+" + p;
  return p;
}

export function validPhone(phone) {
  return /^\+?[1-9]\d{8,14}$/.test(phone);
}

export function token() {
  return crypto.randomBytes(32).toString("hex");
}

export function requestId() {
  return crypto.randomUUID();
}

export function phoneHash(phone) {
  return crypto.createHash("sha256").update(phone).digest("hex");
}

export function sessionKey(phone, deviceToken) {
  return `sessions/${phoneHash(phone)}/${deviceToken}.json`;
}

export function inboxKey(phone, deviceToken) {
  return `inboxes/${phoneHash(phone)}/${deviceToken}.json`;
}

export function requestKey(id) {
  return `requests/${id}.json`;
}

export async function readJSON(key) {
  return await store.get(key, { type: "json", consistency: "strong" });
}

export async function writeJSON(key, value) {
  await store.setJSON(key, value);
}

export async function requireSession(phone, deviceToken) {
  if (!phone || !deviceToken) return null;
  const s = await readJSON(sessionKey(phone, deviceToken));
  if (!s) return null;
  const now = Date.now();
  if (now - Number(s.lastSeen || 0) > 60_000) return null;
  return s;
}
