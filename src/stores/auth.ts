import { defineStore } from 'pinia'
import { AuthService, type AuthResult, type AuthUser } from '@/service/authService'

export const useAuth = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as AuthUser | null,
    loading: false,
    error: '' as string | undefined,
  }),
  getters: {
    isAuthenticated: (s) => Boolean(s.token),
  },
  actions: {
    init(): void {
      const cur = AuthService.current()
      if (cur) {
        this.token = cur.token
        this.user = cur.user
      }
    },
    async login(email: string, password: string): Promise<void> {
      this.loading = true
      this.error = undefined
      try {
        const res: AuthResult = await AuthService.login(email, password)
        this.token = res.token
        this.user = res.user
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : String(e)
        throw e
      } finally {
        this.loading = false
      }
    },
    async logout(): Promise<void> {
      await AuthService.logout()
      this.token = ''
      this.user = null
    },
  },
})
