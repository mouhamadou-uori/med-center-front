import { useAuth } from '../services/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuth()
  
  // Intercepter toutes les requêtes sortantes pour ajouter le token JWT
  nuxtApp.hook('app:created', () => {
    // Pour $fetch
    const originalFetch = globalThis.fetch
    globalThis.fetch = async (input, init) => {
      // Ne pas ajouter le token pour les requêtes d'authentification
      if (typeof input === 'string' && 
         (input.includes('/api/auth/login') || input.includes('/api/auth/logout'))) {
        return originalFetch(input, init)
      }
      
      // Ajouter le token JWT à l'en-tête Authorization
      const token = auth.getToken()
      if (token) {
        init = init || {}
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${token}`
        }
      }
      
      return originalFetch(input, init)
    }
  })
  
  // Intercepter les requêtes useFetch de Nuxt
  nuxtApp.provide('apiFetch', async (url, options = {}) => {
    // Ne pas ajouter le token pour les requêtes d'authentification
    if (url.includes('/api/auth/login') || url.includes('/api/auth/logout')) {
      return useFetch(url, options)
    }
    
    const token = auth.getToken()
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    }
    
    return useFetch(url, options)
  })
})
