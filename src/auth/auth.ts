import NextAuth from "next-auth";
import { AuthorizationEndpointHandler } from "@auth/core/providers";
import { FreeeJWT } from "./getServerSession";

type User = {
  id: number
  email: string
  display_name: string
  first_name: string
  last_name: string
  first_name_kana: string
  last_name_kana: string
}

export const { handlers, signIn } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    {
      id: 'freee',
      name: 'Freee',
      type: 'oauth',
      issuer: 'https://accounts.secure.freee.co.jp',
      authorization: {
        url: 'https://accounts.secure.freee.co.jp/public_api/authorize',
        params: { scope: 'profile email' },
      } satisfies AuthorizationEndpointHandler,
      token: 'https://accounts.secure.freee.co.jp/public_api/token',
      clientId: process.env.FREEE_CLIENT_ID,
      clientSecret: process.env.FREEE_CLIENT_SECRET,
      userinfo: 'https://api.freee.co.jp/api/1/users/me?companies=true',
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account != null) {
        // First login, save the `access_token`, `refresh_token`, and other details into the JWT
        return {
          ...token,
          createdAt: account.created_at! as number,
          expiresIn: account.expires_in!,
          expiresAt: account.expires_at!,
          accessToken: account.access_token!,
          refreshToken: account.refresh_token!,
          uid: (profile!.user as User).id,
        } satisfies FreeeJWT
      } else if (Date.now() < (token.expiresAt as number) * 1000) {
        // Subsequent logins, if the `access_token` is still valid, return the JWT
        return token
      } else {
        // Subsequent logins, if the `access_token` has expired, try to refresh it
        if (!token.refreshToken) throw new Error('Missing refresh token')

        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch(
            'https://accounts.secure.freee.co.jp/public_api/token',
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: process.env.FREEE_CLIENT_ID!,
                client_secret: process.env.FREEE_CLIENT_SECRET!,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken! as string,
              }),
              method: 'POST',
            },
          )

          const responseTokens = await response.json()

          if (!response.ok)
            throw new Error(
              'refreshToken failed. response=' + JSON.stringify(responseTokens),
            )

          return {
            // Keep the previous token properties
            ...token,
            createdAt: responseTokens.created_at! as number,
            expiresIn: responseTokens.expires_in,
            expiresAt: Math.floor(
              Date.now() / 1000 + (responseTokens.expires_in as number),
            ),
            accessToken: responseTokens.access_token,
            refreshToken: responseTokens.refresh_token,
          }
        } catch (error) {
          console.error('Error refreshing access token', error)
          // The error property can be used client-side to handle the refresh token error
          return { ...token, error: 'RefreshAccessTokenError' as const }
        }
      }
    },
  },
})
