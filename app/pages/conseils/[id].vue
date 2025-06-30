<script setup lang="ts">
import type { Conseil, Section, Ressource } from '~/types'

definePageMeta({
  requiresAuth: false,
  layout: 'public'
})

const route = useRoute()
const conseilId = route.params.id
const conseil = ref<Conseil | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Formatage de date amélioré
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Temps de lecture estimé
const estimateReadingTime = (content: string, sections: Section[]) => {
  const wordsPerMinute = 200
  let totalWords = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  
  sections.forEach(section => {
    totalWords += section.contenu.replace(/<[^>]*>/g, '').split(/\s+/).length
  })
  
  return Math.ceil(totalWords / wordsPerMinute)
}

// Chargement des données du conseil
const fetchConseil = async () => {
  try {
    loading.value = true
    error.value = null
    
    const conseilData = await $fetch<Conseil>(`http://localhost:9000/api/medical/conseils/${conseilId}`)
    conseil.value = conseilData
    
  } catch (err: any) {
    console.error('Erreur lors du chargement du conseil:', err)
    error.value = "Impossible de charger ce conseil médical. Il est possible qu'il n'existe pas ou qu'il ne soit pas accessible publiquement."
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConseil()
})

// Fonction pour obtenir l'icône et la couleur du type de ressource
const getRessourceConfig = (type: string) => {
  const configs = {
    PDF: { icon: 'i-lucide-file-text', color: 'red' },
    LIEN: { icon: 'i-lucide-external-link', color: 'blue' },
    VIDEO: { icon: 'i-lucide-play-circle', color: 'green' },
    IMAGE: { icon: 'i-lucide-image', color: 'purple' },
    DOCUMENT: { icon: 'i-lucide-file-text', color: 'gray' }
  }
  return configs[type as keyof typeof configs] || { icon: 'i-lucide-file', color: 'gray' }
}

const navigateBack = () => {
  navigateTo('/conseils')
}

// Computed properties
const sections = computed(() => {
  return conseil.value?.sections?.sort((a, b) => a.ordre - b.ordre) || []
})

const ressources = computed(() => {
  return conseil.value?.ressources || []
})

const readingTime = computed(() => {
  if (!conseil.value) return 0
  return estimateReadingTime(conseil.value.contenu, sections.value)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Chargement -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div class="absolute inset-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p class="mt-6 text-gray-600 font-medium">Chargement du conseil médical...</p>
      </div>
    </div>
    
    <!-- Erreur -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-alert-circle" class="h-8 w-8 text-red-600" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Conseil non disponible</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <UButton 
          color="blue" 
          size="lg" 
          class="w-full"
          @click="navigateBack"
        >
          Retour aux conseils
        </UButton>
      </div>
    </div>
    
    <!-- Contenu du conseil -->
    <template v-else-if="conseil">
      <!-- Entête moderne -->
      <div class="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <!-- Motif de fond -->
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
          <!-- Bouton retour élégant -->
          <UButton
            icon="i-lucide-arrow-left"
            color="white"
            variant="ghost"
            size="sm"
            class="mb-8 hover:bg-white/20 transition-all duration-200"
            @click="navigateBack"
          >
            Retour aux conseils
          </UButton>
          
          <div class="grid lg:grid-cols-3 gap-8 items-start">
            <!-- Contenu principal -->
            <div class="lg:col-span-2">
              <!-- Catégorie et date -->
              <div class="flex items-center gap-4 mb-4">
                <span v-if="conseil.pathologieNom" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                  <UIcon name="i-lucide-tag" class="w-3 h-3 mr-1" />
                  {{ conseil.pathologieNom }}
                </span>
                <div class="flex items-center text-white/80 text-sm">
                  <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-1" />
                  {{ formatDate(conseil.datePublication) }}
                </div>
                <div v-if="readingTime" class="flex items-center text-white/80 text-sm">
                  <UIcon name="i-lucide-clock" class="w-4 h-4 mr-1" />
                  {{ readingTime }} min de lecture
                </div>
              </div>

              <!-- Titre -->
              <h1 class="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {{ conseil.titre }}
              </h1>
              
              <!-- Résumé -->
              <p v-if="conseil.resume" class="text-xl text-white/90 leading-relaxed max-w-3xl">
                {{ conseil.resume }}
              </p>
            </div>
            
            <!-- Auteur -->
            <div class="lg:col-span-1">
              <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div class="flex items-center mb-4">
                  <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {{ conseil.auteurNom?.[0] || 'D' }}{{ conseil.auteurNom?.split(' ')[1]?.[0] || 'r' }}
                  </div>
                  <div class="ml-4">
                    <h3 class="font-semibold text-white">
                      {{ conseil.auteurNom || 'Professionnel de santé' }}
                    </h3>
                    <p class="text-white/80 text-sm">Auteur</p>
                  </div>
                </div>
                <div v-if="conseil.approuveParNom" class="text-white/70 text-sm mb-2">
                  <UIcon name="i-lucide-check-circle" class="w-4 h-4 mr-2 inline" />
                  Approuvé par {{ conseil.approuveParNom }}
                </div>
                <div class="text-white/70 text-sm">
                  <UIcon name="i-lucide-stethoscope" class="w-4 h-4 mr-2 inline" />
                  Conseil médical certifié
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Corps du conseil avec une meilleure lisibilité -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <!-- Contenu principal -->
        <article class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <!-- Introduction avec meilleure typographie -->
          <div class="p-8 lg:p-12">
            <div class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
              <div v-html="conseil.contenu"></div>
            </div>
          </div>
          
          <!-- Sections avec séparateurs élégants -->
          <div v-if="sections.length > 0">
            <div
              v-for="(section, index) in sections"
              :key="section.id"
              class="border-t border-gray-100"
              :class="{ 'bg-gray-50/50': index % 2 === 1 }"
            >
              <div class="p-8 lg:p-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-6 border-l-4 border-blue-600 pl-4">
                  {{ section.titre }}
                </h2>
                <div class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
                  <div v-html="section.contenu"></div>
                </div>
              </div>
            </div>
          </div>
        </article>
        
        <!-- Ressources avec design moderne -->
        <div v-if="ressources.length > 0" class="mt-12">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Ressources complémentaires</h2>
            <p class="text-gray-600">Documents et liens utiles pour approfondir le sujet</p>
          </div>
          
          <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <a
              v-for="ressource in ressources"
              :key="ressource.id"
              :href="ressource.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div :class="`w-12 h-12 rounded-lg flex items-center justify-center bg-${getRessourceConfig(ressource.type).color}-100`">
                    <UIcon 
                      :name="getRessourceConfig(ressource.type).icon" 
                      :class="`h-6 w-6 text-${getRessourceConfig(ressource.type).color}-600`" 
                    />
                  </div>
                  <UIcon name="i-lucide-external-link" class="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {{ ressource.titre }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-3">{{ ressource.description }}</p>
                <div class="mt-4 text-xs text-gray-500 uppercase tracking-wide font-medium">
                  {{ ressource.type }}
                </div>
              </div>
            </a>
          </div>
        </div>
        
        <!-- Pathologie associée avec design amélioré -->
        <div v-if="conseil.pathologieNom" class="mt-12">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <UIcon name="i-lucide-info" class="h-5 w-5 text-white" />
                  </div>
                  <h2 class="text-2xl font-bold text-blue-900">
                    À propos de : {{ conseil.pathologieNom }}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
