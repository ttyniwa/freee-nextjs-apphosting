import { cookies } from "next/headers";
import { getToken } from "@auth/core/jwt";
import type { JWT } from "next-auth/jwt";

export async function getServerSession() {
  const headers = new Headers();
  cookies()
    .getAll()
    .forEach((cookie) => {
      headers.set("cookie", `${cookie.name}=${cookie.value};`);
    });

  const secureCookie = process.env.NODE_ENV === "production";
  const cookieName = secureCookie
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  return (await getToken({
    req: { headers },
    secret: process.env.AUTH_SECRET,
    secureCookie,
    salt: cookieName,
  })) as FreeeJWT | null;
}

export type FreeeJWT = JWT & {
  createdAt: number;
  expiresIn: number;
  expiresAt: number;
  accessToken: string;
  refreshToken: string;
  uid: number;
};
