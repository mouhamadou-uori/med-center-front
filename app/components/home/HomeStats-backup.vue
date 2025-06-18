<script setup lang="ts">
<script setup lang="ts">
import { useAuth } from '~/services/auth'

const props = defineProps({
  period: {
    type: String,
    default: 'daily'
  },
  range: {
    type: Object,
    default: () => ({
      start: new Date(),
      end: new Date()
    })
  },
  showRevenue: {
    type: Boolean,
    default: false
  }
})

const { getCurrentUser, getToken } = useAuth()
const user = getCurrentUser()

// États réactifs pour les données
const nombrePatientsDistincts = ref<number>(0)
const nombreConsultations = ref<number>(0)
const loading = ref<boolean>(false)

console.log('[HomeStats] Current User:', user)

// Charger les données au montage du composable
const loadStats = async () => {
  loading.value = true
  const token = getToken()
  
  if (token && user?.id) {
    try {
      // Vérifier si l'utilisateur est un professionnel de santé
      if (user.role === 'PROFESSIONNEL') {
        // Endpoints spécifiques aux professionnels
        const [patientsResponse, consultsResponse] = await Promise.all([
          fetch(`http://localhost:9000/api/medical/consultations/professionnel/${user.username}/patients-distincts`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`http://localhost:9000/api/medical/consultations/professionnel/${user.username}/total`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ])
        
        if (patientsResponse.ok && consultsResponse.ok) {
          const patientsData = await patientsResponse.json()
          const consultsData = await consultsResponse.json()
          
          nombrePatientsDistincts.value = patientsData ?? 0
          nombreConsultations.value = consultsData ?? 0
        } else {
          console.warn('[HomeStats] API responses not OK:', {
            patients: patientsResponse.status,
            consults: consultsResponse.status
          })
        }
      } else {
        // Pour les utilisateurs ADMIN, afficher des statistiques globales ou valeurs par défaut
        nombrePatientsDistincts.value = 0
        nombreConsultations.value = 0
        console.log('[HomeStats] User is not a professional, using default values')
      }
    } catch (error) {
      console.error('[HomeStats] Error fetching data:', error)
      nombrePatientsDistincts.value = 0
      nombreConsultations.value = 0
    }
  } else {
    console.warn('[HomeStats] No token or user found')
  }
  
  loading.value = false
}

// Charger les données au montage
onMounted(() => {
  loadStats()
})

// Statistiques computed
const stats = computed(() => {
  const baseStats = [
    {
      title: 'Patients Distincts',
      value: nombrePatientsDistincts.value,
      icon: 'i-heroicons-users',
      variation: 0
    },
    {
      title: 'Consultations Totales',
      value: nombreConsultations.value,
      icon: 'i-heroicons-clipboard-document-list',
      variation: 0
    }
  ]

  // Ajouter les statistiques de revenus si activées
  if (props.showRevenue) {
    baseStats.push({
      title: 'Revenus Totaux',
      value: 0, // À implémenter selon l'API
      icon: 'i-heroicons-currency-dollar',
      variation: 0
    })
  }

  return baseStats
})
</script>

<template>
  <UPageGrid class="lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          <template v-if="loading">
            <USkeleton class="h-8 w-16" />
          </template>
          <template v-else>
            {{ stat.value }}
          </template>
        </span>

        <UBadge
          v-if="!loading"
          :color="stat.variation >= 0 ? 'success' : 'error'"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation >= 0 ? '+' : '' }}{{ stat.variation }}%
        </UBadge>
      </div>
      
      <template v-if="user?.role !== 'PROFESSIONNEL'">
        <p class="text-xs text-gray-500 mt-1">
          Données limitées pour le rôle {{ user?.role }}
        </p>
      </template>
    </UPageCard>
  </UPageGrid>
</template>
