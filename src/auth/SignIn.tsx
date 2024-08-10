'use client'
import { signInAction } from './signInAction'

export function SignIn() {
  return (
    <button
      className='py-1.5 px-4 transition-colors bg-green-600 border active:bg-green-800 font-medium border-green-700 text-white rounded-lg hover:bg-green-700 disabled:opacity-50'
      onClick={async () => {
        await signInAction('freee')
      }}
    >
      SignIn
    </button>
  )
}
