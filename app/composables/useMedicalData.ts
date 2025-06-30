import type { Conseil, Pathologie, Categorie } from '~/types'

export function useMedicalData() {
  // États partagés
  const conseils = useState<Conseil[]>('public-conseils', () => [])
  const pathologies = useState<Pathologie[]>('public-pathologies', () => [])
  const categories = useState<Categorie[]>('public-categories', () => [])
  
  const loading = useState('medical-loading', () => ({
    conseils: false,
    pathologies: false,
    categories: false
  }))
  
  // Charger les données des conseils publics
  const fetchConseils = async () => {
    if (conseils.value.length > 0) return conseils.value
    
    loading.value.conseils = true
    try {
      const data = await $fetch<Conseil[]>('http://localhost:9000/api/medical/conseils/publics')
      conseils.value = data
      console.log(`[MedicalData] Loaded ${data.length} conseils`)
      return data
    } catch (error) {
      console.error('[MedicalData] Erreur lors du chargement des conseils:', error)
      return []
    } finally {
      loading.value.conseils = false
    }
  }

  // Charger les données des pathologies
  const fetchPathologies = async (forceReload = false) => {
    if (pathologies.value.length > 0 && !forceReload) return pathologies.value
    
    loading.value.pathologies = true
    try {
      const data = await $fetch<Pathologie[]>('http://localhost:9000/api/medical/pathologies')
      pathologies.value = data
      console.log(`[MedicalData] Loaded ${data.length} pathologies`)
      return data
    } catch (error) {
      console.error('[MedicalData] Erreur lors du chargement des pathologies:', error)
      return []
    } finally {
      loading.value.pathologies = false
    }
  }

  // Charger les catégories
  const fetchCategories = async (forceReload = false) => {
    if (categories.value.length > 0 && !forceReload) return categories.value
    
    loading.value.categories = true
    try {
      const data = await $fetch<Categorie[]>('http://localhost:9000/api/medical/categories')
      categories.value = data
      console.log(`[MedicalData] Loaded ${data.length} categories`)
      return data
    } catch (error) {
      console.error('[MedicalData] Erreur lors du chargement des catégories:', error)
      return []
    } finally {
      loading.value.categories = false
    }
  }
  
  // Charger les pathologies d'une catégorie spécifique
  const fetchPathologiesForCategory = async (categoryId: number) => {
    try {
      const data = await $fetch<Pathologie[]>(`http://localhost:9000/api/medical/categories/${categoryId}/pathologies`)
      console.log(`[MedicalData] Loaded ${data.length} pathologies for category ${categoryId}`)
      return data
    } catch (error) {
      console.error(`[MedicalData] Erreur lors du chargement des pathologies pour la catégorie ${categoryId}:`, error)
      return []
    }
  }
  
  // Grouper les pathologies par catégorie
  const getPathologiesByCategory = () => {
    const grouped: Record<number, Pathologie[]> = {}
    
    // Initialiser les catégories
    categories.value.forEach(cat => {
      grouped[cat.id] = []
    })
    
    // Grouper les pathologies
    pathologies.value.forEach(pathologie => {
      if (pathologie.categorieId && grouped[pathologie.categorieId]) {
        grouped[pathologie.categorieId].push(pathologie)
      }
    })
    
    return grouped
  }
  
  // Fonction pour vérifier si une catégorie a des pathologies
  const hasPathologies = (categoryId: number): boolean => {
    return pathologies.value.some(p => p.categorieId === categoryId)
  }
  
  // Filtrer les catégories qui ont au moins une pathologie
  const getCategoriesWithPathologies = () => {
    return categories.value.filter(cat => hasPathologies(cat.id))
  }
  
  // Charger toutes les données
  const loadAllData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchPathologies(),
      fetchConseils()
    ])
    
    return {
      categories: categories.value,
      pathologies: pathologies.value,
      conseils: conseils.value
    }
  }
  
  return {
    conseils,
    pathologies,
    categories,
    loading,
    fetchConseils,
    fetchPathologies,
    fetchCategories,
    fetchPathologiesForCategory,
    getPathologiesByCategory,
    hasPathologies,
    getCategoriesWithPathologies,
    loadAllData
  }
}
