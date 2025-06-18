// Test du nouveau format d'endpoint
const testNewEndpoint = async () => {
  console.log('=== Test du nouveau format d\'endpoint ===')
  
  // Paramètres de test
  const period = 'daily'
  const startDate = '2024-01-01'
  const endDate = '2024-01-31'
  const idProfessionnel = 1
  
  // Nouveau format: /stats/period/{period}/{start}/{end}/{idProfessionel}
  const endpoint = `http://localhost:9000/api/medical/stats/period/${period}/${startDate}/${endDate}/${idProfessionnel}`
  
  console.log('Endpoint à tester:', endpoint)
  
  // Exemple de token (remplacez par un vrai token)
  const token = 'fake_jwt_token_12345'
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('Réponse:', data)
    } else {
      console.error('Erreur HTTP:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Détails de l\'erreur:', errorText)
    }
    
  } catch (error) {
    console.error('Erreur de connexion:', error)
  }
}

// Exporter pour utilisation
if (typeof window !== 'undefined') {
  // Côté client
  window.testNewEndpoint = testNewEndpoint
  console.log('Function testNewEndpoint available in window object')
} else {
  // Côté serveur
  console.log('testNewEndpoint function created')
}

export { testNewEndpoint }
