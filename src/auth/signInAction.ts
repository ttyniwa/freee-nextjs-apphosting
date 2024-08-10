'use server'

import { signIn } from "@/auth/auth";

export async function signInAction(provider: string) {
  await signIn(provider)
}
