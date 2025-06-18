// Test simple pour vérifier le flux d'authentification et les console.log
import { useAuth } from './services/auth'

// Simulation d'un test d'authentification
const testAuthFlow = () => {
  console.log('=== Test du flux d\'authentification ===')
  
  const { getCurrentUser, getToken } = useAuth()
  
  // Vérifier l'utilisateur actuel
  const user = getCurrentUser()
  console.log('User object type:', typeof user)
  console.log('User is:', user)
  
  if (user) {
    console.log('--- Détails utilisateur ---')
    console.log('ID:', user.id)
    console.log('Nom complet:', `${user.firstName} ${user.lastName}`)
    console.log('Username:', user.username)
    console.log('Role:', user.role)
    console.log('Email:', user.email)
    
    // Test de sérialisation/désérialisation
    const userJson = JSON.stringify(user)
    console.log('User JSON string length:', userJson.length)
    console.log('User JSON (first 100 chars):', userJson.substring(0, 100))
    
    const userParsed = JSON.parse(userJson)
    console.log('Parsed user type:', typeof userParsed)
    console.log('Parsed user ID:', userParsed.id)
  } else {
    console.log('Aucun utilisateur connecté')
  }
  
  // Vérifier le token
  const token = getToken()
  console.log('Token exists:', !!token)
  if (token) {
    console.log('Token length:', token.length)
    console.log('Token start:', token.substring(0, 20) + '...')
  }
}

export { testAuthFlow }
