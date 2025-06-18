// Test de l'authentification optimisée
import { useAuth } from './services/auth'

async function testAuth() {
  const auth = useAuth()
  
  console.log('=== Test du service d\'authentification optimisé ===')
  
  // Test de connexion
  try {
    const success = await auth.login('uori', 'motdepasse') // remplacer par les vrais identifiants
    console.log('Login success:', success)
    
    if (success) {
      const user = auth.getCurrentUser()
      console.log('Current user:', user)
      console.log('User type:', user?.role)
      console.log('User data structure:')
      console.log('- ID:', user?.id)
      console.log('- Name:', `${user?.firstName} ${user?.lastName}`)
      console.log('- Email:', user?.email)
      console.log('- Role:', user?.role)
      
      if (user?.hopital) {
        console.log('- Hospital:', user.hopital.nom)
      } else {
        console.log('- No hospital data (normal for ADMIN users)')
      }
    }
  } catch (error) {
    console.error('Login error:', error)
  }
}

// testAuth() // Décommenter pour tester
