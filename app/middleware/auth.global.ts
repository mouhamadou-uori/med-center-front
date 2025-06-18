import { useAuth } from '../services/auth'
import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  console.log('🔒 Middleware auth appelé pour:', to.path)
  console.log('🌍 Environnement:', {
    client: import.meta.client,
    server: import.meta.server
  })
  
  // Ne protège que les routes ayant meta.requiresAuth
  if (to.meta.requiresAuth) {
    console.log('🛡️ Route protégée détectée')
    
    // Côté serveur, on ne peut pas vérifier le token localStorage
    // On laisse passer et on vérifiera côté client
    if (import.meta.server) {
      console.log('🖥️ Côté serveur - on laisse passer')
      return
    }
    
    // Côté client, on peut vérifier le token
    if (import.meta.client) {
      console.log('🖥️ Côté client - vérification du token')
      const { getToken } = useAuth()
      const token = getToken()
      console.log('🔑 Token présent:', !!token)
      
      if (!token) {
        console.log('❌ Pas de token, redirection vers login')
        return navigateTo('/login')
      }
      console.log('✅ Token valide, accès autorisé')
    }
  } else {
    console.log('🟢 Route non protégée')
  }
  
  console.log('✅ Middleware terminé')
})
