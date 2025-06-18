// Test simple pour reproduire le problème des caractères
export const testCharacterProblem = () => {
  console.log('=== Test du problème des caractères ===')
  
  // Simuler l'objet utilisateur qui cause le problème
  const user = {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    username: 'jdupont',
    role: 'PROFESSIONNEL'
  }
  
  console.log('User object direct:', user)
  
  // Test de serialization/désérialisation
  const userString = JSON.stringify(user)
  console.log('User as JSON string:', userString)
  
  const userParsed = JSON.parse(userString)
  console.log('User parsed from JSON:', userParsed)
  
  // Tester le localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('test_user', userString)
    const retrieved = localStorage.getItem('test_user')
    console.log('Retrieved from localStorage (string):', retrieved)
    
    const parsedFromStorage = JSON.parse(retrieved)
    console.log('Parsed from localStorage:', parsedFromStorage)
    
    // Test des différentes façons d'afficher
    console.log('=== Différentes méthodes d\'affichage ===')
    console.log('Method 1 - Direct object:', parsedFromStorage)
    console.log('Method 2 - JSON.stringify:', JSON.stringify(parsedFromStorage))
    console.log('Method 3 - Individual props:', {
      id: parsedFromStorage.id,
      name: `${parsedFromStorage.firstName} ${parsedFromStorage.lastName}`,
      role: parsedFromStorage.role
    })
    
    // Nettoyer
    localStorage.removeItem('test_user')
  }
}

// Auto-exécution si ce fichier est importé côté client
if (typeof window !== 'undefined') {
  testCharacterProblem()
}
