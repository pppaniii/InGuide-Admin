export interface AuthUser {
  id: string
  name: string
  email: string
}
export interface AuthResult {
  token: string
  user: AuthUser
}

const KEY = 'ing_auth_token'

export const AuthService = {
  async login(email: string, password: string): Promise<AuthResult> {
    // mock check: replace with real API later
    if (!email || !password) throw new Error('Email and password are required')
    // pretend success
    const result: AuthResult = {
      token: crypto.randomUUID(),
      user: { id: 'u1', name: 'Admin', email }
    }
    localStorage.setItem(KEY, JSON.stringify(result))
    return result
  },

  async logout(): Promise<void> {
    localStorage.removeItem(KEY)
  },

  current(): AuthResult | null {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthResult) : null
  }
}
