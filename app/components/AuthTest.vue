<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Test d'authentification</h2>
    
    <div class="mb-4 p-3 bg-blue-50 rounded">
      <p class="text-sm text-blue-700 mb-2">
        <strong>Instructions :</strong>
      </p>
      <ol class="text-sm text-blue-600 list-decimal list-inside space-y-1">
        <li>Cliquez sur "Créer utilisateur test" pour simuler un login</li>
        <li>Allez sur la <a href="/" class="underline font-medium text-blue-800 hover:text-blue-900">page d'accueil</a> pour voir HomeStats</li>
        <li>Vérifiez les logs de la console du navigateur</li>
        <li>Utilisez "Tester utilisateur actuel" pour voir les détails</li>
      </ol>
      
      <div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <p class="text-xs text-yellow-700">
          Si les stats ne s'affichent pas après création de l'utilisateur test, 
          <button @click="debugLocalStorage" class="underline font-medium">cliquez ici pour debug localStorage</button>
        </p>
      </div>
    </div>
    
    <div class="mb-4">
      <button 
        @click="testCurrentUser" 
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Tester utilisateur actuel
      </button>
      
      <button 
        @click="clearStorage" 
        class="bg-red-500 text-white px-4 py-2 rounded mr-2"
      >
        Nettoyer localStorage
      </button>
      
      <button 
        @click="testLogin" 
        class="bg-green-500 text-white px-4 py-2 rounded mr-2"
      >
        Test Login
      </button>
      
      <button 
        @click="createTestUserAndReload" 
        class="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Créer utilisateur test
      </button>
    </div>
    
    <div class="bg-gray-100 p-4 rounded">
      <pre class="text-sm">{{ testResults }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/services/auth'

const { getCurrentUser, getToken, login } = useAuth()
const testResults = ref<string>('')

const logToResults = (message: string) => {
  testResults.value += message + '\n'
  console.log(message)
}

const testCurrentUser = () => {
  testResults.value = ''
  logToResults('=== Test utilisateur actuel ===')
  
  const user = getCurrentUser()
  logToResults(`Type d'utilisateur: ${typeof user}`)
  
  if (user) {
    logToResults(`User object: ${JSON.stringify(user, null, 2)}`)
    logToResults(`ID: ${user.id}`)
    logToResults(`Nom: ${user.firstName} ${user.lastName}`)
    logToResults(`Role: ${user.role}`)
    logToResults(`Username: ${user.username}`)
    
    // Test de problème des caractères
    logToResults('--- Test console.log ---')
    console.log('User direct:', user)
    console.log('User ID:', user.id)
    console.log('User role:', user.role)
    console.log('User name:', `${user.firstName} ${user.lastName}`)
  } else {
    logToResults('Aucun utilisateur trouvé')
  }
  
  const token = getToken()
  logToResults(`Token: ${token ? 'Présent (' + token.length + ' chars)' : 'Absent'}`)
}

const clearStorage = () => {
  testResults.value = ''
  logToResults('=== Nettoyage localStorage ===')
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_roles')
    localStorage.removeItem('current_user')
    logToResults('localStorage nettoyé')
    setTimeout(() => window.location.reload(), 500)
  }
}

const testLogin = async () => {
  testResults.value = ''
  logToResults('=== Test Login ===')
  logToResults('Utilisez le bouton "Créer utilisateur test" pour simuler un login')
}

const createTestUserAndReload = () => {
  testResults.value = ''
  logToResults('=== Création utilisateur de test ===')
  
  if (typeof window !== 'undefined') {
    // Données utilisateur sans références circulaires
    const testUser = {
      id: 1,
      lastName: 'Dupont',
      firstName: 'Jean',
      username: 'jdupont',
      email: 'jean.dupont@example.com',
      tel: '0123456789',
      role: 'PROFESSIONNEL',
      dateCreation: '2024-01-01T00:00:00Z',
      dateSuppression: null,
      actif: true,
      specialite: 'Cardiologie',
      numeroOrdre: '12345',
      hopital: {
        id: 1,
        nom: 'Hôpital Test',
        type: 'PUBLIC',
        region: 'Test Region',
        ville: 'Test City',
        adresse: '123 Test Street',
        telephone: '0123456789',
        email: 'hopital@test.com'
      }
    }
    
    // Stocker dans localStorage
    localStorage.setItem('current_user', JSON.stringify(testUser))
    localStorage.setItem('auth_token', 'fake_jwt_token_12345')
    localStorage.setItem('auth_roles', JSON.stringify(['PROFESSIONNEL']))
    
    logToResults('Utilisateur de test créé. Rechargement de la page...')
    setTimeout(() => window.location.reload(), 1000)
  }
}

const debugLocalStorage = () => {
  testResults.value = ''
  logToResults('=== Debug localStorage ===')
  
  if (typeof window !== 'undefined') {
    const keys = ['current_user', 'auth_token', 'auth_roles']
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      logToResults(`${key}: ${value ? value.substring(0, 100) + '...' : 'null'}`)
    })
    
    // Test de lecture d'utilisateur
    const userStr = localStorage.getItem('current_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        logToResults('User parsed successfully:')
        logToResults(`- ID: ${user.id}`)
        logToResults(`- Role: ${user.role}`)
        logToResults(`- Name: ${user.firstName} ${user.lastName}`)
      } catch (e) {
        logToResults(`Error parsing user: ${e instanceof Error ? e.message : String(e)}`)
      }
    } else {
      logToResults('No user in localStorage')
    }
  }
}
</script>
