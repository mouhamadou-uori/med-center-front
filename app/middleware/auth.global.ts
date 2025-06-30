import { useAuth } from '../services/auth'
import { navigateTo, abortNavigation } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  console.log('🌍 Environnement:', {
    client: import.meta.client,
    server: import.meta.server
  })
  
  // Ignore les pages publiques comme /conseils
  if (to.path === '/conseils' || to.path.startsWith('/login')) {
    console.log('🟢 Page publique - pas de vérification')
    return
  }
  
  // Protège les routes ayant meta.requiresAuth ou la route racine "/"
  if (to.meta.requiresAuth || to.path === '/') {
    console.log('🛡️ Route protégée détectée')
    
    // Côté serveur, on laisse passer MAIS on stocke la route demandée
    if (import.meta.server) {
      console.log('🖥️ Côté serveur - on laisse passer sans redirection')
      // Le client fera la vérification
      return
    }
    
    // Côté client
    if (import.meta.client) {
      console.log('🖥️ Côté client - vérification du token')
      const { getToken } = useAuth()
      const token = getToken()
      console.log('🔑 Token présent:', !!token)
      
      if (!token) {
        console.log('❌ Pas de token, accès non autorisé')
        // Ne pas vérifier uniquement le path '/', protéger toutes les routes
        // Blocage immédiat et redirection synchrone
        document.body.style.display = 'none' // Cache le contenu pendant la redirection
        window.location.replace('/conseils') // Remplace l'historique plutôt que d'ajouter
        throw new Error('Redirection vers page publique') // Interrompt l'exécution
      }
      
      // Si on est ici, c'est qu'on a un token valide
      console.log('✅ Token valide, accès autorisé')
    }
  } else {
    console.log('🟢 Route non protégée')
  }
  
  console.log('✅ Middleware terminé')
})
