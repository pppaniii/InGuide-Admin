<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Left Side -->
      <div class="img-container">
        <img :src="coverImage" alt="Floor plan cover">
      </div>

      <!-- Right form -->
      <form class="form" @submit.prevent="submit" novalidate>
        <h1 class="title">Welcome to Admin Panel</h1>
        <p class="subtitle">Sign in to manage building maps and navigation data.</p>

        <!-- Email -->
        <label class="field" :class="{ invalid: invalidEmail }">
          <span class="label">E-mail</span>
          <input v-model.trim="email" type="email" autocomplete="username" />
        </label>

        <!-- Password -->
        <label class="field" :class="{ invalid: invalidPassword }">
          <span class="label">Password</span>
          <input v-model="password" type="password" autocomplete="current-password" />
        </label>

        <button class="signin" type="submit" :disabled="auth.loading">
          <span v-if="!auth.loading">Sign in</span>
          <span v-else>Signing in…</span>
        </button>

        <p class="error" :class="{ show: !!formError }" aria-live="polite">
          {{ formError || ' ' }}
        </p>
    
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/stores/auth'
import coverImage from '@/assets/Cover.png'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

const email = ref('')
const password = ref('')

// Allowed credentials
const ALLOWED_EMAIL = 'admin@gmail.com'
const ALLOWED_PASSWORD = 'Admin1423'

const formError = ref('')
const invalidEmail = ref(false)
const invalidPassword = ref(false)
const emailRecheck = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

function validate(e: string, p: string) {
  const emailBad = !e || !emailRecheck.test(e)
  const passwordBad = p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p)

  invalidEmail.value = emailBad
  invalidPassword.value = passwordBad

  if (e !== ALLOWED_EMAIL || p !== ALLOWED_PASSWORD){
    invalidEmail.value = e !== ALLOWED_EMAIL
    invalidPassword.value = e !== ALLOWED_PASSWORD
    return 'Invalid Email or Password.'
  }
  return ''
}

async function submit() {
  // snapshot current inputs → set error state once
  formError.value = validate(email.value.trim(), password.value)
  if (formError.value) return

  try {
    await auth.login(ALLOWED_EMAIL, ALLOWED_PASSWORD)
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch {
    // show server error in the single line, but only after this click
    formError.value = auth.error || 'Sign in failed.'
  }
}
</script>

<style scoped src="../styles/LoginView.css"></style>
