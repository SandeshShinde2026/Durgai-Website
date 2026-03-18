'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function AdminLoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
      callbackUrl: '/admin',
    })

    if (!result || result.error) {
      setError('Invalid credentials or account temporarily locked. Please try again later.')
      setIsSubmitting(false)
      return
    }

    router.replace(result.url ?? '/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="font-heading text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to edit all sections and locale content.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-primary"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-primary"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-11 w-full rounded-lg bg-primary text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
