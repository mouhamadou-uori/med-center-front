<script setup lang="ts">
import { useAuth } from '~/services/auth'

// Props simples pour Nuxt 3
interface Props {
  period?: string
  range?: {
    start: Date
    end: Date
  }
  showRevenue?: boolean
}

// Définition des props sans les macros défaillantes
const props = {
  period: 'daily' as string,
  range: {
    start: new Date(),
    end: new Date()
  },
  showRevenue: false as boolean
}

const { getCurrentUser, getToken } = useAuth()
const user = getCurrentUser()

// États réactifs pour les données
const nombrePatientsDistincts = ref<number>(0)
const nombreConsultations = ref<number>(0)
const loading = ref<boolean>(false)

// Affichage plus propre pour debug
console.log('[HomeStats] Current User ID:', user?.id)
console.log('[HomeStats] Current User Role:', user?.role)
console.log('[HomeStats] Current User Name:', user ? `${user.firstName} ${user.lastName}` : 'Not found')
console.log('[HomeStats] Current User Username:', user?.username)
console.log('[HomeStats] User object exists:', !!user)
console.log('[HomeStats] User role check (PROFESSIONNEL):', user?.role === 'PROFESSIONNEL')

// Interface pour les DTOs de réponse API
interface PatientsDistinctsDto {
  count: number
}

interface ConsultationsTotalDto {
  total: number
}

// const fetchPatients = async (): Promise<number> => {
//   const token = getToken()
//   if (!token || !user?.username) return 0

//   try {
//     const { data, error } = await useFetch<number>(
//       `http://localhost:9000/api/medical/consultations/professionnel/${user.id}/patients-distincts`,
//       {
//         method: 'GET',
//         options: {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       }
//     )

//     if (error.value) {
//       console.warn('[HomeStats] Patients API error:', error.value)
//       return 0
//     }

//     return data.value?.count ?? 0
//   } catch (error) {
//     console.error('[HomeStats] Error fetching patients:', error)
//     return 0
//   }
// }  

const fetchPatients = async (): Promise<number> => {
  const token = getToken()
  if (!token || !user?.username) return 0

  try {
    const response = await fetch(`http://localhost:9000/api/medical/consultations/professionnel/${user.id}/patients-distincts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn('[HomeStats] Consultations API response not OK:', response.status)
      return 0
    }
    
    const data = await response.json()
    return typeof data === 'number' ? data : 0
  } catch (error) {
    console.error('[HomeStats] Error fetching consultations:', error)
    return 0
  }
}

const fetchConsultations = async (): Promise<number> => {
  const token = getToken()
  if (!token || !user?.username) return 0

  try {
    const response = await fetch(`http://localhost:9000/api/medical/consultations/professionnel/${user.id}/total`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn('[HomeStats] Consultations API response not OK:', response.status)
      return 0
    }
    
    const data = await response.json()
    return typeof data === 'number' ? data : 0
  } catch (error) {
    console.error('[HomeStats] Error fetching consultations:', error)
    return 0
  }
}

// Charger les données au montage du composable
const loadStats = async () => {
  loading.value = true
  
  console.log('[HomeStats] loadStats called')
  console.log('[HomeStats] User in loadStats:', user)
  console.log('[HomeStats] User role in loadStats:', user?.role)
  
  if (user?.role === 'PROFESSIONNEL') {
    console.log('[HomeStats] User is PROFESSIONNEL, fetching data...')
    try {
      // Appels parallèles avec $fetch
      const [patients, consultations] = await Promise.all([
        fetchPatients(),
        fetchConsultations()
      ])
      
      nombrePatientsDistincts.value = patients
      nombreConsultations.value = consultations
      
      console.log('[HomeStats] Loaded stats:', {
        patients,
        consultations
      })
    } catch (error) {
      console.error('[HomeStats] Error loading stats:', error)
      nombrePatientsDistincts.value = 0
      nombreConsultations.value = 0
    }
  } else {
    // Pour les utilisateurs ADMIN ou autres rôles
    nombrePatientsDistincts.value = 0
    nombreConsultations.value = 0
    console.log('[HomeStats] User is not a professional or user is null, using default values')
    console.log('[HomeStats] Actual role:', user?.role)
    console.log('[HomeStats] User exists:', !!user)
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
