'use client'

import { signInAction, signOutAction } from "@/app/actions"
import { Button } from "./ui/button"
 
export function SignIn() {
  return (
      <Button onClick={async () => await signInAction()}>Signin with Google</Button>
  )
}

export function SignOut() {
  return (
    <button className="text-xs italic underline decoration-wavy" onClick={async () => await signOutAction()}>Sign out</button>
  )
}