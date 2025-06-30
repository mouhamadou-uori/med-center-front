<script setup lang="ts">
import { useDicomService } from '~/services/dicom'

definePageMeta({
  requiresAuth: true
})

const dicomService = useDicomService()

// États
const loading = ref(true)
const error = ref<string | null>(null)
const period = ref('month')
const startDate = ref(new Date())
const endDate = ref(new Date())
const stats = ref({
  totalPatients: 0,
  totalStudies: 0,
  totalImages: 0,
  modalityBreakdown: {} as Record<string, number>
})

// Données pour les graphiques
const chartData = computed(() => ({
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
  datasets: [{
    label: 'Études',
    data: [12, 19, 3, 5, 2, 3],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  }]
}))

const modalityChartData = computed(() => ({
  labels: Object.keys(stats.value.modalityBreakdown),
  datasets: [{
    data: Object.values(stats.value.modalityBreakdown),
    backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
  }]
}))

// Définir la période
const setPeriod = (newPeriod: string) => {
  period.value = newPeriod
  const now = new Date()
  endDate.value = new Date(now)
  
  switch (newPeriod) {
    case 'week':
      startDate.value = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate.value = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      break
    case 'year':
      startDate.value = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
  }
  
  loadStats()
}

// Charger les statistiques
const loadStats = async () => {
  loading.value = true
  error.value = null
  
  try {
    const hopitalId = dicomService.getUserHopitalId()
    
    if (!hopitalId) {
      error.value = "Vous n'êtes associé à aucun hôpital"
      return
    }
    
    const response = await dicomService.getPatients(hopitalId)
    const patients = response.patients
    
    let totalStudies = 0
    let totalImages = 0
    let modalityBreakdown: Record<string, number> = {}
    
    for (const patient of patients) {
      totalStudies += patient.studies.length
      totalImages += patient.studies.length * 10 // Estimation
      
      // Estimation des modalités
      if (patient.patientId.includes('CT')) {
        modalityBreakdown['CT'] = (modalityBreakdown['CT'] || 0) + 1
      } else if (patient.patientId.includes('MR')) {
        modalityBreakdown['MR'] = (modalityBreakdown['MR'] || 0) + 1
      } else {
        modalityBreakdown['CR'] = (modalityBreakdown['CR'] || 0) + 1
      }
    }
    
    stats.value = {
      totalPatients: patients.length,
      totalStudies,
      totalImages,
      modalityBreakdown
    }
  } catch (err) {
    console.error('Erreur lors du chargement des statistiques:', err)
    error.value = "Impossible de charger les statistiques d'imagerie"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setPeriod('month')
})
</script>

<template>
  <UDashboardPanel id="imagerie-rapports">
    <template #header>
      <UDashboardNavbar title="Rapports d'Imagerie">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <UButton 
                size="sm" 
                :color="period === 'week' ? 'primary' : 'gray'"
                :variant="period === 'week' ? 'soft' : 'ghost'"
                @click="setPeriod('week')"
              >
                Semaine
              </UButton>
              <UButton 
                size="sm" 
                :color="period === 'month' ? 'primary' : 'gray'"
                :variant="period === 'month' ? 'soft' : 'ghost'"
                @click="setPeriod('month')"
              >
                Mois
              </UButton>
              <UButton 
                size="sm" 
                :color="period === 'year' ? 'primary' : 'gray'"
                :variant="period === 'year' ? 'soft' : 'ghost'"
                @click="setPeriod('year')"
              >
                Année
              </UButton>
            </div>
            
            <UButton color="gray" variant="ghost" icon="i-lucide-printer">
              Imprimer
            </UButton>
            
            <UButton
              to="/imagerie" 
              icon="i-lucide-layout-dashboard"
              color="primary"
              variant="ghost"
            >
              Tableau de bord
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-6">
        <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
          <UIcon name="i-lucide-loader-2" class="animate-spin size-8 text-primary" />
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex gap-3">
            <UIcon name="i-lucide-alert-triangle" class="text-red-600 size-6 mt-0.5" />
            <div>
              <h3 class="text-red-800 font-medium">Erreur</h3>
              <p class="text-red-700">{{ error }}</p>
              <UButton 
                class="mt-2"
                size="sm"
                icon="i-lucide-refresh-cw"
                @click="loadStats"
              >
                Réessayer
              </UButton>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- Période sélectionnée -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              {{ startDate.toLocaleDateString() }} – {{ endDate.toLocaleDateString() }}
            </p>
          </div>

          <!-- Statistiques clés -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UCard class="shadow-sm">
              <div class="flex items-center justify-between p-4">
                <div>
                  <div class="text-sm text-gray-600">Nombre de patients</div>
                  <div class="text-3xl font-bold mt-1">{{ stats.totalPatients }}</div>
                </div>
                <UIcon name="i-lucide-users" class="text-blue-600 size-8" />
              </div>
            </UCard>

            <UCard class="shadow-sm">
              <div class="flex items-center justify-between p-4">
                <div>
                  <div class="text-sm text-gray-600">Nombre d'études</div>
                  <div class="text-3xl font-bold mt-1">{{ stats.totalStudies }}</div>
                </div>
                <UIcon name="i-lucide-folder" class="text-green-600 size-8" />
              </div>
            </UCard>

            <UCard class="shadow-sm">
              <div class="flex items-center justify-between p-4">
                <div>
                  <div class="text-sm text-gray-600">Nombre d'images</div>
                  <div class="text-3xl font-bold mt-1">{{ stats.totalImages }}</div>
                </div>
                <UIcon name="i-lucide-image" class="text-purple-600 size-8" />
              </div>
            </UCard>
          </div>

          <!-- Répartition par modalité -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-medium">Répartition par modalité</h3>
            </template>
            
            <div class="space-y-3 p-4">
              <div 
                v-for="(count, modality) in stats.modalityBreakdown" 
                :key="modality"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div class="flex items-center gap-3">
                  <UBadge :color="modality === 'CT' ? 'blue' : modality === 'MR' ? 'green' : 'purple'">
                    {{ modality }}
                  </UBadge>
                  <span class="font-medium">{{ modality === 'CT' ? 'Scanner' : modality === 'MR' ? 'IRM' : 'Radiographie' }}</span>
                </div>
                <div class="text-right">
                  <div class="font-bold">{{ count }}</div>
                  <div class="text-xs text-gray-500">
                    {{ Math.round((count / Math.max(1, Object.values(stats.modalityBreakdown).reduce((a, b) => a + b, 0))) * 100) }}%
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Rapport détaillé -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Rapport détaillé</h3>
                <UButton color="primary" size="sm" icon="i-lucide-download">
                  Exporter
                </UButton>
              </div>
            </template>
            
            <div class="prose dark:prose-invert max-w-none p-4">
              <h4>Résumé d'activité d'imagerie médicale</h4>
              <p>
                Ce rapport présente une analyse de l'activité d'imagerie médicale 
                pour la période du {{ startDate.toLocaleDateString() }} au {{ endDate.toLocaleDateString() }}.
              </p>
              
              <h5>Statistiques générales</h5>
              <ul>
                <li>Nombre total de patients : <strong>{{ stats.totalPatients }}</strong></li>
                <li>Nombre total d'études : <strong>{{ stats.totalStudies }}</strong></li>
                <li>Nombre total d'images : <strong>{{ stats.totalImages }}</strong></li>
                <li>Ratio études/patient : <strong>{{ (stats.totalStudies / Math.max(1, stats.totalPatients)).toFixed(2) }}</strong></li>
              </ul>
              
              <h5>Répartition par modalité</h5>
              <ul>
                <li v-for="(count, modality) in stats.modalityBreakdown" :key="modality">
                  {{ modality }} : <strong>{{ count }}</strong>
                  ({{ ((count / Math.max(1, Object.values(stats.modalityBreakdown).reduce((a, b) => a + b, 0))) * 100).toFixed(1) }}%)
                </li>
              </ul>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
