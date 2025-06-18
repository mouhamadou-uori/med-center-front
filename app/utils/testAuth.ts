// Script pour tester l'authentification avec des données simulées
export const createTestUser = () => {
  if (typeof window === 'undefined') return
  
  console.log('=== Création d\'un utilisateur de test ===')
  
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
  
  console.log('Utilisateur de test créé:', {
    id: testUser.id,
    name: `${testUser.firstName} ${testUser.lastName}`,
    role: testUser.role
  })
  
  // Recharger la page pour voir les changements
  window.location.reload()
}

export const clearTestUser = () => {
  if (typeof window === 'undefined') return
  
  console.log('=== Suppression de l\'utilisateur de test ===')
  localStorage.removeItem('current_user')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_roles')
  
  window.location.reload()
}
