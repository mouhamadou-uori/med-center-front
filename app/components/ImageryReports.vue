<script setup lang="ts">
import { useDicomService } from '~/services/dicom'

const emit = defineEmits(['close'])
const dicomService = useDicomService()

// États
const loading = ref(true)
const error = ref<string | null>(null)
const stats = ref({
  totalPatients: 0,
  totalStudies: 0,
  modalityBreakdown: {} as Record<string, number>
})

// Période de rapport
const period = ref('month')

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
    let modalityBreakdown: Record<string, number> = {}
    
    for (const patient of patients) {
      totalStudies += patient.studies.length
      
      // Estimation des modalités (dans une vraie app, ceci viendrait de l'API)
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
  loadStats()
})
</script>

<template>
  <!-- Modal responsive -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Rapports d'Imagerie
        </h2>
        <UButton 
          color="gray" 
          variant="ghost" 
          icon="i-lucide-x" 
          @click="emit('close')"
        />
      </div>

      <!-- Contenu -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div v-if="loading" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <USkeleton v-for="i in 3" :key="i" class="h-24" />
          </div>
          <USkeleton class="h-64" />
        </div>

        <div v-else-if="error" class="text-center py-12">
          <UIcon name="i-lucide-alert-triangle" class="text-red-500 size-12 mx-auto mb-4" />
          <p class="text-red-600 mb-4">{{ error }}</p>
          <UButton @click="loadStats">Réessayer</UButton>
        </div>

        <div v-else class="space-y-6">
          <!-- Statistiques principales -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UCard class="text-center">
              <div class="p-4">
                <UIcon name="i-lucide-users" class="size-12 mx-auto text-blue-600 mb-2" />
                <div class="text-2xl font-bold">{{ stats.totalPatients }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Patients</div>
              </div>
            </UCard>

            <UCard class="text-center">
              <div class="p-4">
                <UIcon name="i-lucide-folder" class="size-12 mx-auto text-green-600 mb-2" />
                <div class="text-2xl font-bold">{{ stats.totalStudies }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Études</div>
              </div>
            </UCard>

            <UCard class="text-center">
              <div class="p-4">
                <UIcon name="i-lucide-activity" class="size-12 mx-auto text-purple-600 mb-2" />
                <div class="text-2xl font-bold">{{ Object.keys(stats.modalityBreakdown).length }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Modalités</div>
              </div>
            </UCard>
          </div>

          <!-- Répartition par modalité -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-medium">Répartition par modalité</h3>
            </template>
            
            <div class="space-y-3">
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
              <h3 class="text-lg font-medium">Rapport détaillé</h3>
            </template>
            
            <div class="prose dark:prose-invert max-w-none">
              <h4>Résumé d'activité d'imagerie médicale</h4>
              <p>
                Ce rapport présente une analyse de l'activité d'imagerie médicale 
                pour la période sélectionnée.
              </p>
              
              <h5>Statistiques générales</h5>
              <ul>
                <li>Nombre total de patients : <strong>{{ stats.totalPatients }}</strong></li>
                <li>Nombre total d'études : <strong>{{ stats.totalStudies }}</strong></li>
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

      <!-- Footer -->
      <div class="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3">
          <UButton color="primary" variant="soft" icon="i-lucide-download">
            Exporter le rapport
          </UButton>
          <UButton color="gray" @click="emit('close')">Fermer</UButton>
        </div>
      </div>
    </div>
  </div>
</template>
