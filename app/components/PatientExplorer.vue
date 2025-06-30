<script setup lang="ts">
import { useDicomService } from '~/services/dicom'
import type { OrthancPatient, OrthancPatientDetails } from '~/services/dicom'

const emit = defineEmits(['close'])
const dicomService = useDicomService()

// États
const loading = ref(true)
const error = ref<string | null>(null)
const patients = ref<OrthancPatient[]>([])
const selectedPatient = ref<OrthancPatient | null>(null)
const patientDetails = ref<OrthancPatientDetails | null>(null)
const loadingDetails = ref(false)
const searchTerm = ref('')

// Charger les patients
const loadPatients = async () => {
  try {
    loading.value = true
    const hopitalId = dicomService.getUserHopitalId()
    
    if (!hopitalId) {
      error.value = "Vous n'êtes associé à aucun hôpital"
      return
    }
    
    const response = await dicomService.getPatients(hopitalId)
    patients.value = response.patients
    error.value = null
  } catch (err) {
    console.error('Erreur lors du chargement des patients:', err)
    error.value = "Impossible de charger la liste des patients"
  } finally {
    loading.value = false
  }
}

// Charger les détails d'un patient
const loadPatientDetails = async (patient: OrthancPatient) => {
  selectedPatient.value = patient
  loadingDetails.value = true
  
  try {
    const details = await dicomService.getPatientDetails(patient.id)
    patientDetails.value = details
  } catch (err) {
    console.error('Erreur lors du chargement des détails:', err)
    console.error("Impossible de charger les détails du patient")
  } finally {
    loadingDetails.value = false
  }
}

// Patients filtrés
const filteredPatients = computed(() => {
  if (!searchTerm.value) return patients.value
  
  const term = searchTerm.value.toLowerCase()
  return patients.value.filter(patient => {
    return (
      patient.patientName?.toLowerCase().includes(term) ||
      patient.patientId?.toLowerCase().includes(term)
    )
  })
})

// Charger les données au montage
onMounted(() => {
  loadPatients()
})
</script>

<template>
  <!-- Modal plein écran responsive -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Explorer les Patients DICOM
        </h2>
        <UButton 
          color="gray" 
          variant="ghost" 
          icon="i-lucide-x" 
          @click="emit('close')"
          class="shrink-0"
        />
      </div>

      <!-- Contenu principal -->
      <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <!-- Liste des patients -->
        <div class="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <UInput
              v-model="searchTerm"
              icon="i-lucide-search"
              placeholder="Rechercher un patient..."
              class="w-full"
            />
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 sm:p-6">
            <div v-if="loading" class="space-y-3">
              <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
            </div>
            
            <div v-else-if="error" class="text-center py-8">
              <UIcon name="i-lucide-alert-triangle" class="text-red-500 size-12 mx-auto mb-4" />
              <p class="text-red-600 mb-4">{{ error }}</p>
              <UButton @click="loadPatients" size="sm">Réessayer</UButton>
            </div>
            
            <div v-else-if="filteredPatients.length === 0" class="text-center py-8">
              <UIcon name="i-lucide-users" class="text-gray-400 size-12 mx-auto mb-4" />
              <p class="text-gray-600 dark:text-gray-400">
                {{ searchTerm ? 'Aucun résultat' : 'Aucun patient trouvé' }}
              </p>
            </div>
            
            <div v-else class="space-y-2">
              <UCard
                v-for="patient in filteredPatients"
                :key="patient.id"
                @click="loadPatientDetails(patient)"
                class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                :class="selectedPatient?.id === patient.id ? 'ring-2 ring-primary-500' : ''"
              >
                <div class="p-3">
                  <div class="font-medium truncate">{{ patient.patientName || 'Anonyme' }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ID: {{ patient.patientId }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {{ patient.studies.length }} étude(s)
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>

        <!-- Détails du patient -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div v-if="!selectedPatient" class="flex-1 flex items-center justify-center p-6">
            <div class="text-center">
              <UIcon name="i-lucide-user-search" class="size-16 mx-auto text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sélectionnez un patient
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Choisissez un patient dans la liste pour voir ses détails
              </p>
            </div>
          </div>
          
          <div v-else-if="loadingDetails" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <UIcon name="i-lucide-loader-2" class="animate-spin size-8 text-primary mb-4" />
              <p>Chargement des détails...</p>
            </div>
          </div>
          
          <div v-else class="flex-1 overflow-y-auto p-4 sm:p-6">
            <!-- Informations patient -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                👤 Informations Patient
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Nom</div>
                  <div class="font-medium break-words">{{ selectedPatient.patientName || 'Anonyme' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">ID Patient</div>
                  <div class="font-medium font-mono break-all">{{ selectedPatient.patientId }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Sexe</div>
                  <div class="font-medium">{{ selectedPatient.patientSex || '–' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Date de naissance</div>
                  <div class="font-medium">{{ dicomService.formatDicomDate(selectedPatient.patientBirthDate) }}</div>
                </div>
              </div>
            </div>

            <!-- Études -->
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-green-900 dark:text-green-300 mb-4">
                🏥 Études DICOM ({{ patientDetails?.studies?.length || selectedPatient.studies.length }})
              </h3>
              
              <div v-if="patientDetails?.studies?.length > 0" class="space-y-3">
                <UCard
                  v-for="study in patientDetails.studies"
                  :key="study.id"
                  class="shadow-sm"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">
                        {{ study.studyDescription || 'Étude sans description' }}
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ dicomService.formatDicomDate(study.studyDate) }}
                        {{ study.studyTime ? dicomService.formatDicomTime(study.studyTime) : '' }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {{ study.series.length }} série(s)
                      </div>
                    </div>
                    <UBadge color="primary" size="sm">
                      {{ study.series.length }} séries
                    </UBadge>
                  </div>
                </UCard>
              </div>
              
              <div v-else class="text-center py-8">
                <UIcon name="i-lucide-folder" class="size-12 mx-auto text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">Aucune étude disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <div class="flex justify-end">
          <UButton color="gray" @click="emit('close')">Fermer</UButton>
        </div>
      </div>
    </div>
  </div>
</template>
