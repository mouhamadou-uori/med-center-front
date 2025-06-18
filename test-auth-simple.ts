// Test simple de l'authentification
console.log('=== Test d\'authentification ===')

const baseUrl = 'http://localhost:9000'
const testUser = {
  username: 'testuser',
  password: 'password123'
}

async function testAuth() {
  try {
    console.log('1. Test de login...')
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    })
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText)
      return
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Login successful:', {
      hasToken: !!loginData.token,
      roles: loginData.roles
    })
    
    console.log('2. Test de récupération des données utilisateur...')
    
    const userResponse = await fetch(`${baseUrl}/api/medical/utilisateur/${testUser.username}`, {
      headers: {
        Authorization: `Bearer ${loginData.token}`
      }
    })
    
    if (!userResponse.ok) {
      console.error('❌ User data fetch failed:', userResponse.status, userResponse.statusText)
      return
    }
    
    const userData = await userResponse.json()
    console.log('✅ User data retrieved:', {
      id: userData.id,
      name: `${userData.firstName} ${userData.lastName}`,
      role: userData.role,
      hasCircularRefs: checkForCircularRefs(userData)
    })
    
    // Test des endpoints de statistiques
    if (userData.role === 'PROFESSIONNEL') {
      console.log('3. Test des endpoints professionnels...')
      
      const [patientsResponse, consultsResponse] = await Promise.all([
        fetch(`${baseUrl}/api/medical/consultations/professionnel/${userData.username}/patients-distincts`, {
          headers: { Authorization: `Bearer ${loginData.token}` }
        }),
        fetch(`${baseUrl}/api/medical/consultations/professionnel/${userData.username}/total`, {
          headers: { Authorization: `Bearer ${loginData.token}` }
        })
      ])
      
      console.log('📊 Stats endpoints status:', {
        patients: patientsResponse.status,
        consultations: consultsResponse.status
      })
      
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json()
        console.log('👥 Patients distincts:', patientsData)
      }
      
      if (consultsResponse.ok) {
        const consultsData = await consultsResponse.json()
        console.log('📋 Consultations totales:', consultsData)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

function checkForCircularRefs(obj: any, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') return false
  if (seen.has(obj)) return true
  
  seen.add(obj)
  
  for (const key in obj) {
    if (checkForCircularRefs(obj[key], seen)) {
      return true
    }
  }
  
  seen.delete(obj)
  return false
}

// Exécuter le test
testAuth()
