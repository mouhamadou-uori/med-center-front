<script setup lang="ts">
import type { Conseil, Pathologie, Categorie } from '~/types'

definePageMeta({
  requiresAuth: false, // Accessible sans authentification
  layout: 'public' // Utilise un layout public
})

// États
const conseils = ref<Conseil[]>([])
const pathologies = ref<Pathologie[]>([])
const categories = ref<Categorie[]>([])
const loading = ref({
  conseils: true,
  pathologies: true,
  categories: true
})
const activeTab = ref('conseils')
const searchQuery = ref('')

// Fonction de filtrage des conseils
const filteredConseils = computed(() => {
  if (!searchQuery.value) return conseils.value
  
  const query = searchQuery.value.toLowerCase()
  return conseils.value.filter(conseil => 
    conseil.titre.toLowerCase().includes(query) || 
    conseil.resume.toLowerCase().includes(query) ||
    conseil.pathologie?.nom.toLowerCase().includes(query) ||
    conseil.professionnel?.specialite.toLowerCase().includes(query)
  )
})

// Fonction de filtrage des pathologies
const filteredPathologies = computed(() => {
  if (!searchQuery.value) return pathologies.value
  
  const query = searchQuery.value.toLowerCase()
  return pathologies.value.filter(pathologie => 
    pathologie.nom.toLowerCase().includes(query) || 
    pathologie.description.toLowerCase().includes(query)
  )
})

// Charger les données des conseils publics
const fetchConseils = async () => {
  loading.value.conseils = true
  try {
    const data = await $fetch<Conseil[]>('http://localhost:9000/api/medical/conseils')
    conseils.value = data
    console.log('conseil loaded : ', conseils.value)
  } catch (error) {
    console.error('Erreur lors du chargement des conseils:', error)
  } finally {
    loading.value.conseils = false
  }
}

// Charger les données des pathologies
const fetchPathologies = async () => {
  loading.value.pathologies = true
  try {
    const data = await $fetch<Pathologie[]>('http://localhost:9000/api/medical/pathologies')
    console.log(`Loaded ${data.length} pathologies`)
    // Vérifier que chaque pathologie a un slug valide pour la navigation
    const invalidPathologies = data.filter(p => !p.slug);
    if (invalidPathologies.length > 0) {
      console.warn(`Warning: ${invalidPathologies.length} pathologies have no slug`);
    }
    pathologies.value = data
  } catch (error) {
    console.error('Erreur lors du chargement des pathologies:', error)
  } finally {
    loading.value.pathologies = false
  }
}

// Charger les catégories
const fetchCategories = async () => {
  loading.value.categories = true
  try {
    const data = await $fetch<Categorie[]>('http://localhost:9000/api/medical/categories')
    console.log(`Loaded ${data.length} categories`)
    // Le champ dans la base de données est 'active' et non 'actif'
    // On s'assure que chaque catégorie a la bonne propriété
    categories.value = data.map(cat => ({
      ...cat,
      // Assure que nous avons 'actif' pour la compatibilité avec notre code
      actif: cat.active !== undefined ? cat.active : true
    }))
    console.log(`Active categories: ${categories.value.filter(c => c.actif).length}`)
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
  } finally {
    loading.value.categories = false
  }
}

// Récupérer les conseils liés à une pathologie spécifique
const fetchConseilsForPathologie = async (pathologieId: number) => {
  try {
    // Utilisation de l'endpoint spécifique pour récupérer les conseils liés à une pathologie
    const data = await $fetch<Conseil[]>(`http://localhost:9000/api/medical/pathologies/${pathologieId}/conseils`)
    console.log(`Loaded ${data.length} conseils for pathologie #${pathologieId}`)
    return data
  } catch (error) {
    console.error(`Erreur lors du chargement des conseils pour la pathologie ${pathologieId}:`, error)
    return []
  }
}

// Formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Grouper les pathologies par catégorie
const pathologiesByCategory = computed(() => {
  const grouped: Record<number, Pathologie[]> = {}
  
  // Initialiser les catégories
  categories.value.forEach(cat => {
    if (cat.actif || cat.active) { // Vérifier les deux propriétés pour assurer la compatibilité
      grouped[cat.id] = []
    }
  })
  
  // Grouper les pathologies
  pathologies.value.forEach(pathologie => {
    // Vérifier que la pathologie est publiée (publiee dans la base de données)
    // et que la catégorie existe dans notre map
    if (pathologie.publiee !== false && grouped[pathologie.categorieId]) {
      grouped[pathologie.categorieId].push(pathologie)
    }
  })
  
  return grouped
})

// Obtenir uniquement les catégories qui ont des pathologies
const categoriesWithPathologies = computed(() => {
  return categories.value.filter(cat => {
    const categoryId = cat.id;
    const hasPathologies = pathologiesByCategory.value[categoryId]?.length > 0;
    return (cat.actif || cat.active) && hasPathologies;
  });
})

// Charger les données au montage
onMounted(() => {
  console.log("Mounting public index page")
  fetchConseils()
  fetchPathologies()
  fetchCategories()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Bannière principale -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div class="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Conseils Médicaux Professionnels
          </h1>
          <p class="mt-6 text-xl max-w-2xl mx-auto">
            Découvrez des conseils médicaux fiables rédigés par des professionnels de santé qualifiés pour mieux comprendre et gérer diverses pathologies.
          </p>
          
          <!-- Barre de recherche -->
          <div class="mt-8 sm:max-w-lg sm:mx-auto sm:text-center">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher des conseils ou pathologies..."
                class="w-full py-3 px-5 rounded-full text-gray-900 focus:ring-2 focus:ring-blue-500 border-0 shadow-md"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <UIcon name="i-lucide-search" class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Navigation par tabs -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div class="border-b border-gray-200">
        <div class="flex justify-center space-x-8">
          <button
            @click="activeTab = 'conseils'"
            class="pb-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'conseils' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Conseils Médicaux
          </button>
        </div>
      </div>
    </div>
    
    <!-- Contenu principal -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Onglet Conseils -->
      <div v-if="activeTab === 'conseils'">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Conseils Médicaux Récents</h2>
        
        <!-- Chargement -->
        <div v-if="loading.conseils" class="text-center py-12">
          <UIcon name="i-lucide-loader-2" class="h-12 w-12 mx-auto text-blue-500 animate-spin" />
          <p class="mt-4 text-gray-600">Chargement des conseils médicaux...</p>
        </div>
        
        <!-- Message si aucun résultat -->
        <div v-else-if="filteredConseils.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
          <UIcon name="i-lucide-file-question" class="h-16 w-16 mx-auto text-gray-400" />
          <h3 class="mt-2 text-lg font-medium text-gray-900">Aucun conseil trouvé</h3>
          <p class="mt-1 text-gray-500">
            {{ searchQuery ? 'Aucun conseil ne correspond à votre recherche.' : 'Aucun conseil médical public n\'est disponible pour le moment.' }}
          </p>
        </div>
        
        <!-- Grille de conseils -->
        <div v-else class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div v-for="conseil in filteredConseils" :key="conseil.id" class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div class="p-6">
              <div class="flex items-center mb-3">
                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {{ conseil.pathologieNom || 'Général' }}
                </span>
                <span class="text-gray-400 text-sm ml-auto">
                  {{ formatDate(conseil.datePublication) }}
                </span>
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ conseil.titre }}</h3>
              <p class="text-gray-600 mb-4 line-clamp-3">{{ conseil.resume }}</p>
              
              <div class="flex items-center mt-6">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                    {{ conseil.auteurNom?.[0] }}
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ conseil.auteurNom }}
                  </p>
                </div>
                <NuxtLink 
                  :to="`/conseils/${conseil.id}`" 
                  class="ml-auto bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Lire
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Onglet Pathologies -->
      <div v-if="activeTab === 'pathologies'">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Pathologies par Catégorie</h2>
        
        <!-- Chargement -->
        <div v-if="loading.pathologies || loading.categories" class="text-center py-12">
          <UIcon name="i-lucide-loader-2" class="h-12 w-12 mx-auto text-blue-500 animate-spin" />
          <p class="mt-4 text-gray-600">Chargement des pathologies...</p>
        </div>
        
        <!-- Message si aucun résultat -->
        <div v-else-if="filteredPathologies.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
          <UIcon name="i-lucide-folder-x" class="h-16 w-16 mx-auto text-gray-400" />
          <h3 class="mt-2 text-lg font-medium text-gray-900">Aucune pathologie trouvée</h3>
          <p class="mt-1 text-gray-500">
            {{ searchQuery ? 'Aucune pathologie ne correspond à votre recherche.' : 'Aucune pathologie n\'est disponible pour le moment.' }}
          </p>
        </div>
        
        <!-- Si recherche, afficher résultats plats -->
        <div v-else-if="searchQuery" class="space-y-8">
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Résultats de recherche</h3>
              
              <ul class="divide-y divide-gray-200">
                <li v-for="pathologie in filteredPathologies" :key="pathologie.id" class="py-4">
                  <NuxtLink :to="`/public/pathologies/${pathologie.slug}`" class="block hover:bg-gray-50">
                    <div class="flex items-center">
                      <div class="min-w-0 flex-1">
                        <p class="text-lg font-medium text-blue-600">{{ pathologie.nom }}</p>
                        <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ pathologie.description }}</p>
                      </div>
                      <div class="flex-shrink-0">
                        <UIcon name="i-lucide-chevron-right" class="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Sinon afficher par catégorie -->
        <div v-else class="space-y-8">
          <!-- Débogage -->
          <div v-if="process.dev && categories.length === 0" class="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
            <p class="text-yellow-800">
              <strong>Debug:</strong> Aucune catégorie n'a été trouvée.
            </p>
          </div>

          <div v-for="categorie in categoriesWithPathologies" :key="categorie.id" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center">
                <UIcon 
                  :name="categorie.icone || 'i-lucide-folder'" 
                  class="h-6 w-6 mr-3" 
                  :class="categorie.couleur ? `text-${categorie.couleur}-500` : 'text-gray-500'"
                />
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ categorie.nom }}</h3>
              </div>
              
              <div class="mt-4">
                <p class="text-sm text-gray-600">{{ categorie.description }}</p>
              </div>
              
              <div class="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div 
                  v-for="pathologie in pathologiesByCategory[categorie.id] || []" 
                  :key="pathologie.id"
                  class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <NuxtLink :to="`/public/pathologies/${pathologie.slug}`" class="block">
                    <h4 class="font-medium text-blue-600">{{ pathologie.nom }}</h4>
                    <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ pathologie.description }}</p>
                  </NuxtLink>
                </div>
                
                <div v-if="!pathologiesByCategory[categorie.id]?.length" class="border border-gray-200 rounded-lg p-4 text-center">
                  <p class="text-gray-500 text-sm">Aucune pathologie dans cette catégorie</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Message si aucune catégorie avec pathologies -->
          <div v-if="categoriesWithPathologies.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
            <UIcon name="i-lucide-folder-x" class="h-16 w-16 mx-auto text-gray-400" />
            <h3 class="mt-2 text-lg font-medium text-gray-900">Aucune catégorie disponible</h3>
            <p class="mt-1 text-gray-500">
              Les catégories de pathologies n'ont pas encore été configurées ou ne contiennent pas de pathologies publiées.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pied de page -->
    <footer class="bg-white border-t border-gray-200">
      <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="text-center text-gray-500 text-sm">
          <p>© {{ new Date().getFullYear() }} MedCenter - Plateforme de conseils médicaux</p>
          <p class="mt-2">Les informations fournies sur ce site sont destinées à informer et non à remplacer la relation entre un patient et son médecin.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
