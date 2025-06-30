<script setup lang="ts">
import { useDicomService } from '~/services/dicom'
import { useAuth } from '~/services/auth'

definePageMeta({
  requiresAuth: true
})

const { getCurrentUser } = useAuth()
const user = getCurrentUser()
const dicomService = useDicomService()

// États pour les statistiques
const stats = ref({
  totalPatients: 0,
  totalStudies: 0,
  totalSeries: 0
})

const hopitalInfo = ref({
  nom: '',
  id: null as number | null
})

const loading = ref(true)
const error = ref<string | null>(null)

// États pour les modals
const isPatientModalOpen = ref(false)
const isReportModalOpen = ref(false)
const isDownloadModalOpen = ref(false)

// Chargement des statistiques
const loadStats = async () => {
  try {
    // Récupérer l'ID de l'hôpital de l'utilisateur
    const hopitalId = dicomService.getUserHopitalId()
    
    if (!hopitalId) {
      error.value = "Vous n'êtes associé à aucun hôpital"
      loading.value = false
      return
    }
    
    // Récupérer les données des patients
    const patientsData = await dicomService.getPatients(hopitalId)
    
    // Calculer les statistiques
    const totalPatients = patientsData.patients.length
    let totalStudies = 0
    
    for (const patient of patientsData.patients) {
      totalStudies += patient.studies.length
    }
    
    // Mettre à jour les statistiques
    stats.value = {
      totalPatients,
      totalStudies,
      totalSeries: 0 // Nécessiterait des appels API supplémentaires
    }
    
    // Informations sur l'hôpital
    hopitalInfo.value = {
      nom: patientsData.hopitalNom,
      id: patientsData.hopitalId
    }
    
  } catch (err) {
    console.error('Erreur lors du chargement des statistiques:', err)
    error.value = "Impossible de charger les données d'imagerie médicale"
  } finally {
    loading.value = false
  }
}

// Charger les données au montage du composant
onMounted(() => {
  loadStats()
})
</script>

<template>
  <UDashboardPanel id="imagerie-dashboard">
    <template #header>
      <UDashboardNavbar title="Imagerie Médicale">
        <template #subtitle>
          <p class="text-gray-500 dark:text-gray-400">
            {{ hopitalInfo.nom || 'Chargement...' }}
          </p>
        </template>
        
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="gray"
            variant="ghost"
            :loading="loading"
            @click="loadStats"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-6">
        <!-- États de chargement et d'erreur -->
        <div v-if="loading" class="flex justify-center items-center min-h-[200px]">
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
          <!-- Statistiques -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard class="shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Patients DICOM</div>
                  <div class="text-2xl sm:text-3xl font-bold mt-1">{{ stats.totalPatients }}</div>
                </div>
                <UIcon name="i-lucide-users" class="text-blue-600 size-8" />
              </div>
            </UCard>

            <UCard class="shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Études totales</div>
                  <div class="text-2xl sm:text-3xl font-bold mt-1">{{ stats.totalStudies }}</div>
                </div>
                <UIcon name="i-lucide-folder" class="text-green-600 size-8" />
              </div>
            </UCard>

            <UCard class="shadow-sm sm:col-span-2 lg:col-span-1">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Rapports</div>
                  <div class="text-2xl sm:text-3xl font-bold mt-1">Consulter</div>
                </div>
                <UIcon name="i-lucide-bar-chart-2" class="text-purple-600 size-8" />
              </div>
            </UCard>
          </div>

          <!-- Actions principales -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard 
              class="cursor-pointer hover:shadow-lg transition-shadow"
              @click="isPatientModalOpen = true"
            >
              <div class="text-center p-4">
                <UIcon name="i-lucide-users" class="size-16 mx-auto text-blue-600 mb-4" />
                <h3 class="text-lg font-medium mb-2">Explorer les patients</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Accéder aux dossiers d'imagerie des patients
                </p>
              </div>
            </UCard>
            
            <UCard 
              class="cursor-pointer hover:shadow-lg transition-shadow"
              @click="isReportModalOpen = true"
            >
              <div class="text-center p-4">
                <UIcon name="i-lucide-clipboard-list" class="size-16 mx-auto text-green-600 mb-4" />
                <h3 class="text-lg font-medium mb-2">Rapports & statistiques</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Visualiser les rapports et statistiques d'imagerie
                </p>
              </div>
            </UCard>
            
            <UCard 
              class="cursor-pointer hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1"
              @click="isDownloadModalOpen = true"
            >
              <div class="text-center p-4">
                <UIcon name="i-lucide-download" class="size-16 mx-auto text-purple-600 mb-4" />
                <h3 class="text-lg font-medium mb-2">Téléchargement</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Exporter des études au format DICOM
                </p>
              </div>
            </UCard>
          </div>

          <!-- Informations système -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-info" class="text-blue-600 size-5" />
                <h3 class="text-lg font-medium">Informations système</h3>
              </div>
            </template>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Hôpital</div>
                <div class="font-medium break-words">{{ hopitalInfo.nom || 'Non spécifié' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 dark:text-gray-400">ID Hôpital</div>
                <div class="font-medium">{{ hopitalInfo.id || 'N/A' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Utilisateur</div>
                <div class="font-medium break-words">{{ user?.firstName }} {{ user?.lastName }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Rôle</div>
                <div class="font-medium">{{ user?.role || 'Non spécifié' }}</div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modales responsive -->
  <PatientExplorer v-if="isPatientModalOpen" @close="isPatientModalOpen = false" />
  <ImageryReports v-if="isReportModalOpen" @close="isReportModalOpen = false" />
  <ImageryDownload 
    v-if="isDownloadModalOpen" 
    :studies="[]" 
    :closeModal="() => isDownloadModalOpen = false" 
  />
</template>