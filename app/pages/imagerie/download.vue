<script setup lang="ts">
import { useDicomService } from '~/services/dicom'
import type { OrthancPatient, OrthancStudy } from '~/services/dicom'

definePageMeta({
  requiresAuth: true
})

const toast = useToast()

const dicomService = useDicomService()

// États
const loading = ref(true)
const error = ref<string | null>(null)
const patients = ref<OrthancPatient[]>([])
const selectedPatient = ref<OrthancPatient | null>(null)
const selectedStudies = ref<string[]>([])
const studySelections = ref<Record<string, boolean>>({})
const studies = ref<OrthancStudy[]>([])
const downloadInProgress = ref(false)

// Recherche
const searchTerm = ref('')
const searchResults = ref<OrthancPatient[]>([])

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

// Charger les études d'un patient
const loadPatientStudies = async (patient: OrthancPatient) => {
  selectedPatient.value = patient
  selectedStudies.value = []
  studies.value = []
  
  try {
    loading.value = true
    const details = await dicomService.getPatientDetails(patient.id)
    studies.value = details.studies
  } catch (err) {
    console.error('Erreur lors du chargement des études:', err)
    toast.add({
      title: 'Erreur',
      description: "Impossible de charger les études du patient",
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Rechercher un patient
const searchPatients = () => {
  if (!searchTerm.value) {
    searchResults.value = []
    return
  }
  const term = searchTerm.value.toLowerCase()
  searchResults.value = patients.value.filter((patient: OrthancPatient) => {
    return (
      patient.patientName?.toLowerCase().includes(term) ||
      patient.patientId?.toLowerCase().includes(term)
    )
  })
}

// Télécharger les études sélectionnées
const downloadSelectedStudies = async () => {
  if (selectedStudies.value.length === 0) {
    console.warn("Veuillez sélectionner au moins une étude")
    return
  }
  
  downloadInProgress.value = true
  
  try {
    console.log(`Préparation de ${selectedStudies.value.length} étude(s)`)
    
    // Simulation du téléchargement
    setTimeout(() => {
      console.log(`${selectedStudies.value.length} étude(s) téléchargée(s)`)
      downloadInProgress.value = false
    }, 2000)
    
  } catch (err) {
    console.error('Erreur lors du téléchargement:', err)
    downloadInProgress.value = false
  }
}

// Charger les données au montage
// Mettre à jour la liste des études sélectionnées
const updateSelectedStudies = () => {
  selectedStudies.value = Object.keys(studySelections.value).filter(
    studyId => studySelections.value[studyId]
  )
}

// Observer les changements dans la recherche
watch(searchTerm, () => {
  searchPatients()
})

// Charger les données au montage
onMounted(() => {
  loadPatients()
})
</script>
<template>
  <UDashboardPanel id="imagerie-download">
    <template #header>
      <UDashboardNavbar title="Téléchargement d'Images">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-download"
            :disabled="selectedStudies.length === 0 || downloadInProgress"
            :loading="downloadInProgress"
            @click="downloadSelectedStudies"
          >
            Télécharger ({{ selectedStudies.length }})
          </UButton>
          
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
      <div class="p-4 sm:p-6">
        <div v-if="loading && !selectedPatient" class="flex justify-center items-center min-h-[300px]">
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

        <div v-else>
          <!-- UI à deux colonnes -->
          <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <!-- Liste des patients (1/3 de l'écran) -->
            <div class="lg:col-span-2 space-y-4">
              <UCard class="shadow-sm">
                <template #header>
                  <h3 class="font-medium">Sélectionner un patient</h3>
                </template>
                
                <UInput
                  v-model="searchTerm"
                  icon="i-lucide-search"
                  placeholder="Rechercher un patient..."
                  class="mb-4"
                />
                
                <div class="h-[400px] overflow-y-auto">
                  <div v-if="searchTerm && searchResults.length === 0" class="text-center py-8">
                    <p class="text-gray-500">Aucun résultat pour "{{ searchTerm }}"</p>
                  </div>
                  
                  <div v-else class="space-y-2">
                    <div 
                      v-for="patient in searchTerm ? searchResults : patients" 
                      :key="patient.id"
                      @click="loadPatientStudies(patient)"
                      class="p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      :class="selectedPatient?.id === patient.id ? 'bg-primary-50 border border-primary-200' : ''"
                    >
                      <div class="font-medium">{{ patient.patientName || 'Anonyme' }}</div>
                      <div class="text-sm text-gray-600">
                        ID: {{ patient.patientId }} | 
                        {{ patient.studies.length }} études
                      </div>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
            
            <!-- Liste des études (2/3 de l'écran) -->
            <div class="lg:col-span-5">
              <UCard class="shadow-sm">
                <template #header>
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium">
                      {{ selectedPatient ? `Études de ${selectedPatient.patientName || 'Patient Anonyme'}` : 'Études disponibles' }}
                    </h3>
                    
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-600" v-if="selectedStudies.length > 0">
                        {{ selectedStudies.length }} étude(s) sélectionnée(s)
                      </span>
                      <UButton 
                        v-if="selectedStudies.length > 0"
                        color="primary" 
                        size="sm" 
                        icon="i-lucide-download"
                        :loading="downloadInProgress"
                        @click="downloadSelectedStudies"
                      >
                        Télécharger la sélection
                      </UButton>
                    </div>
                  </div>
                </template>
                
                <div v-if="!selectedPatient" class="text-center py-12">
                  <UIcon name="i-lucide-folder-search" class="size-16 mx-auto text-gray-400 mb-4" />
                  <h4 class="text-lg font-medium text-gray-700 mb-2">Sélectionnez un patient</h4>
                  <p class="text-gray-600">
                    Veuillez choisir un patient dans la liste pour voir ses études disponibles
                  </p>
                </div>
                
                <div v-else-if="loading" class="flex justify-center items-center h-40">
                  <UIcon name="i-lucide-loader-2" class="animate-spin size-8 text-primary" />
                </div>
                
                <div v-else>
                  <UTable
                    :rows="studies"
                    :columns="[
                      { key: 'checkbox', label: '' },
                      { key: 'description', label: 'Description' },
                      { key: 'date', label: 'Date' },
                      { key: 'series', label: 'Séries' },
                      { key: 'actions', label: '' }
                    ]"
                  >
                    <template #checkbox-data="{ row }">
                      <UCheckbox
                        v-model="studySelections[row.id]"
                        :name="`study-${row.id}`"
                        @change="updateSelectedStudies"
                      />
                    </template>
                    <template #description-data="{ row }">
                      <div>
                        <div class="font-medium">{{ row.studyDescription || 'Étude sans description' }}</div>
                        <div class="text-xs text-gray-600">ID: {{ row.id.substring(0, 8) + '...' }}</div>
                      </div>
                    </template>
                    <template #date-data="{ row }">
                      {{ dicomService.formatDicomDate(row.studyDate) }}
                      <div v-if="row.studyTime" class="text-xs text-gray-600">
                        {{ dicomService.formatDicomTime(row.studyTime) }}
                      </div>
                    </template>
                    <template #series-data="{ row }">
                      <UBadge color="primary">
                        {{ row.series.length }} série(s)
                      </UBadge>
                    </template>
                    <template #actions-data="{ row }">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        icon="i-lucide-download"
                        @click="selectedStudies = [row.id]; downloadSelectedStudies()"
                      >
                        Télécharger
                      </UButton>
                    </template>
                  </UTable>
                </div>
              </UCard>
            </div>
          </div>
          <!-- Instructions -->
          <UCard class="shadow-sm mt-6">
            <template #header>
              <h3 class="font-medium">Instructions de téléchargement</h3>
            </template>
            
            <div class="prose">
              <p>
                Cette page vous permet de télécharger des études d'imagerie médicale au format DICOM. 
                Suivez les étapes ci-dessous :
              </p>
              
              <ol>
                <li>Sélectionnez un patient dans la liste à gauche</li>
                <li>Cochez les études que vous souhaitez télécharger</li>
                <li>Cliquez sur le bouton "Télécharger la sélection"</li>
                <li>Les études sélectionnées seront téléchargées sous forme d'archive ZIP</li>
              </ol>
              
              <p>
                <strong>Note :</strong> Les fichiers DICOM peuvent être volumineux. 
                Le téléchargement peut prendre quelques minutes selon la taille des études.
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
