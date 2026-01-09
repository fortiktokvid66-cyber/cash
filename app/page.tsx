'use client'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) router.push('/dashboard')
    else alert(error.message)
  }

  async function signup() {
    const { error } = await supabase.auth.signUp({ email, password })
    if (!error) router.push('/dashboard')
    else alert(error.message)
  }

  return (
    <div className="card">
      <h2>Login / Register</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <p>
  Don’t have an account?{' '}
  <a href="/signup" style={{ color: '#22c55e' }}>Sign up</a>
</p>

    </div>
  )
}
