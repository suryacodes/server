import { env } from "@/config/env";
import crypto from "node:crypto";

const SECRET = env.CURSOR_SECRET!;

export function encodeCursor(id: string) {
  const payload = Buffer.from(JSON.stringify({ id })).toString("base64url");

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function decodeCursor(cursor: string) {
  const [payload, signature] = cursor.split(".");

  if (!payload || !signature) {
    throw new Error("Invalid cursor");
  }

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid cursor");
  }

  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    id: string;
  };
}
