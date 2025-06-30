<script setup lang="ts">
import { useDicomService } from '~/services/dicom'
import type { OrthancPatient, OrthancPatientDetails } from '~/services/dicom'

definePageMeta({
  requiresAuth: true
})

const dicomService = useDicomService()

// États
const loading = ref(true)
const error = ref<string | null>(null)
const patients = ref<OrthancPatient[]>([])
const selectedPatient = ref<OrthancPatient | null>(null)
const patientDetails = ref<OrthancPatientDetails | null>(null)
const loadingDetails = ref(false)
const searchTerm = ref('')
const hopitalName = ref('')

// Modal
const detailModalOpen = ref(false)

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
    hopitalName.value = response.hopitalNom
    error.value = null
  } catch (err) {
    console.error('Erreur lors du chargement des patients:', err)
    error.value = "Impossible de charger la liste des patients"
  } finally {
    loading.value = false
  }
}

// Charger les détails d'un patient
const showPatientDetails = async (patient: OrthancPatient) => {
  selectedPatient.value = patient
  detailModalOpen.value = true
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
  <UDashboardPanel id="imagerie-patients">
    <template #header>
      <UDashboardNavbar title="Patients Imagerie">
        <template #subtitle>
          <p class="text-gray-500 dark:text-gray-400" v-if="hopitalName">
            {{ hopitalName }}
          </p>
        </template>
        
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            to="/imagerie" 
            icon="i-lucide-layout-dashboard"
            color="primary"
            variant="ghost"
          >
            Tableau de bord
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 space-y-6">
        <div class="mb-4">
          <UInput
            v-model="searchTerm"
            icon="i-lucide-search"
            placeholder="Rechercher un patient par nom ou ID..."
            size="lg"
            class="w-full md:max-w-md"
          />
        </div>

        <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
          <UIcon name="i-lucide-loader-2" class="animate-spin size-8 text-primary" />
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex gap-3">
            <UIcon name="i-lucide-alert-triangle" class="text-red-600 size-6 mt-0.5" />
            <div>
              <h3 class="text-red-800 font-medium">Erreur</h3>
              <p class="text-red-700">{{ error }}</p>
              <UButton 
                class="mt-2"
                size="sm"
                icon="i-lucide-refresh-cw"
                @click="loadPatients"
              >
                Réessayer
              </UButton>
            </div>
          </div>
        </div>

        <div v-else-if="filteredPatients.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
          <UIcon name="i-lucide-users" class="size-16 mx-auto text-gray-400 mb-4" />
          <h3 class="text-xl font-medium text-gray-700">Aucun patient trouvé</h3>
          <p v-if="searchTerm" class="text-gray-600 mt-2">
            Aucun résultat pour "{{ searchTerm }}". Essayez une autre recherche.
          </p>
          <p v-else class="text-gray-600 mt-2">
            Aucun patient disponible dans le système.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard 
            v-for="patient in filteredPatients" 
            :key="patient.id" 
            class="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            @click="showPatientDetails(patient)"
          >
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium">{{ patient.patientName || 'Anonyme' }}</h3>
                <p class="text-sm text-gray-600">ID: {{ patient.patientId }}</p>
              </div>

              <UBadge v-if="patient.studies.length > 0" color="primary">
                {{ patient.studies.length }} études
              </UBadge>
              <UBadge v-else color="gray">
                0 étude
              </UBadge>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-3">
              <div>
                <p class="text-xs text-gray-500">Date de naissance</p>
                <p class="text-sm">{{ dicomService.formatDicomDate(patient.patientBirthDate) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Sexe</p>
                <p class="text-sm">{{ patient.patientSex || '–' }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modal détails patient -->
  <UModal v-model="detailModalOpen" :ui="{ width: 'max-w-5xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">
            Détails du Patient
          </h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="detailModalOpen = false" />
        </div>
      </template>

      <div v-if="loadingDetails" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="animate-spin size-8 text-primary" />
      </div>

      <div v-else-if="patientDetails">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-500">Nom du patient</p>
            <p class="font-medium">{{ patientDetails.patientName || 'Anonyme' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">ID Patient</p>
            <p class="font-medium">{{ patientDetails.patientIdDicom }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Date de naissance</p>
            <p class="font-medium">{{ dicomService.formatDicomDate(patientDetails.patientBirthDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Sexe</p>
            <p class="font-medium">{{ patientDetails.patientSex || '–' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">ID Orthanc</p>
            <p class="font-mono text-sm truncate">{{ patientDetails.patientId }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Dernière mise à jour</p>
            <p class="font-medium">{{ new Date(patientDetails.lastUpdate).toLocaleString() }}</p>
          </div>
        </div>

        <h4 class="font-medium text-lg mb-2 mt-6">Études ({{ patientDetails.studies.length }})</h4>
        
        <div v-if="patientDetails.studies.length === 0" class="text-center py-6 bg-gray-50 rounded">
          <p class="text-gray-600">Ce patient n'a pas d'études disponibles</p>
        </div>
        
        <div v-else class="space-y-3">
          <UCard 
            v-for="study in patientDetails.studies" 
            :key="study.id"
            class="shadow-sm"
          >
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium">{{ study.studyDescription || 'Étude sans description' }}</h3>
                <p class="text-sm text-gray-600">
                  Date: {{ dicomService.formatDicomDate(study.studyDate) }}
                  <span v-if="study.studyTime" class="ml-2">
                    {{ dicomService.formatDicomTime(study.studyTime) }}
                  </span>
                </p>
              </div>

              <UBadge :color="study.series.length > 0 ? 'primary' : 'gray'">
                {{ study.series.length }} séries
              </UBadge>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-3">
              <div>
                <p class="text-xs text-gray-500">Numéro d'accession</p>
                <p class="text-sm">{{ study.accessionNumber || '–' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">ID Étude</p>
                <p class="text-sm font-mono truncate">{{ study.id }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            @click="detailModalOpen = false"
          >
            Fermer
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
