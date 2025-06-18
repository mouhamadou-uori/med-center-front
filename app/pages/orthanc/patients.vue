<script setup lang="ts">
import { useAuth } from '~/services/auth'

definePageMeta({
  requiresAuth: true
})

interface OrthancPatient {
  id: string
  patientName: string
  patientBirthDate: string
  patientSex: string
  patientId: string
  lastUpdate: string
  studies: string[]
  mainDicomTags: {
    OtherPatientIDs?: string
    PatientBirthDate: string
    PatientID: string
    PatientName: string
    PatientSex: string
  }
  stable: boolean
}

interface OrthancSeries {
  id: string
  seriesDescription: string
  seriesNumber: string
  modality: string
  seriesInstanceUID: string
  bodyPartExamined: string | null
  lastUpdate: string
  instancesCount: number
  seriesMainDicomTags: Record<string, string>
  stable: boolean
}

interface OrthancStudy {
  id: string
  studyDate: string
  studyTime: string
  studyDescription: string
  studyInstanceUID: string
  accessionNumber: string
  lastUpdate: string
  studyMainDicomTags: Record<string, string>
  series: OrthancSeries[]
  stable: boolean
}

interface OrthancPatientDetails {
  orthancUrl: string
  patientId: string
  patientName: string
  patientBirthDate: string
  patientSex: string
  patientIdDicom: string
  lastUpdate: string
  patientMainDicomTags: Record<string, string>
  studies: OrthancStudy[]
  stable: boolean
}

interface OrthancSeries {
  id: string
  seriesDescription: string
  seriesNumber: string
  modality: string
  seriesInstanceUID: string
  bodyPartExamined: string | null
  lastUpdate: string
  instancesCount: number
  seriesMainDicomTags: Record<string, string>
  stable: boolean
}

interface OrthancStudy {
  id: string
  studyDate: string
  studyTime: string
  studyDescription: string
  studyInstanceUID: string
  accessionNumber: string
  lastUpdate: string
  studyMainDicomTags: Record<string, string>
  series: OrthancSeries[]
  stable: boolean
}

interface OrthancPatientDetails {
  orthancUrl: string
  patientId: string
  patientName: string
  patientBirthDate: string
  patientSex: string
  patientIdDicom: string
  lastUpdate: string
  patientMainDicomTags: Record<string, string>
  studies: OrthancStudy[]
  stable: boolean
}

interface OrthancResponse {
  orthancUrl: string
  hopitalId: number
  hopitalNom: string
  patients: OrthancPatient[]
}

const toast = useToast()
const table = useTemplateRef('table')

// État du popup de détails
const isDetailModalOpen = ref(false)
const selectedPatient = ref<OrthancPatient | null>(null)
const patientDetails = ref<OrthancPatientDetails | null>(null)
const isLoadingDetails = ref(false)
const detailsError = ref<string | null>(null)

// État pour le modal des études
const selectedStudy = ref<OrthancStudy | null>(null)
const selectedSeries = ref<OrthancSeries | null>(null)
const isStudyDetailsOpen = ref(false)

const columnFilters = ref([{
  id: 'patientName',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

const { getCurrentUser } = useAuth()
const currentUser = getCurrentUser()

// État pour les données Orthanc
const orthancData = ref<OrthancResponse | null>(null)
const status = ref('idle')
const error = ref<string | null>(null)

// Fetch des patients Orthanc
const fetchOrthancPatients = async () => {
  const user = currentUser as any
  if (!user?.hopital?.id) {
    error.value = 'Aucun hôpital associé au professionnel'
    return
  }

  try {
    status.value = 'pending'
    const response = await $fetch<OrthancResponse>(
      `http://localhost:9000/api/medical/hopitaux/${user.hopital.id}/patients-orthanc`
    )
    orthancData.value = response
    status.value = 'success'
  } catch (err) {
    error.value = 'Erreur lors du chargement des patients Orthanc'
    status.value = 'error'
    console.error('Erreur fetch Orthanc:', err)
  }
}

// Charger les données au montage
onMounted(() => {
  fetchOrthancPatients()
})

// Extraction des patients de la réponse Orthanc
const patients = computed(() => orthancData.value?.patients || [])

// Statistiques
const nombrePatientsOrthanc = computed(() => patients.value.length)
const nombreEtudesTotal = computed(() => 
  patients.value.reduce((total: number, patient: OrthancPatient) => total + patient.studies.length, 0)
)

// Données pour l'affichage
const hopitalNom = computed(() => {
  const data = orthancData.value as OrthancResponse | null
  return data?.hopitalNom || ''
})

// Fonction pour ouvrir le popup de détails
const openPatientDetails = (patient: OrthancPatient) => {
  console.log('👁️ Ouverture des détails du patient:', patient.id)
  selectedPatient.value = patient
  isDetailModalOpen.value = true
  
  if (!patientDetails.value || patientDetails.value.patientId !== patient.id) {
    // Charger les détails uniquement si ce n'est pas déjà fait pour ce patient
    loadPatientDetails(patient.id)
  }
}

// Fonction pour charger les détails complets d'un patient
const loadPatientDetails = async (patientId: string) => {
  const user = currentUser as any
  if (!user?.hopital?.id) {
    detailsError.value = 'Aucun hôpital associé au professionnel'
    return
  }

  try {
    isLoadingDetails.value = true
    detailsError.value = null
    
    console.log('🔍 Chargement des détails pour patient:', patientId)
    
    const response = await $fetch<OrthancPatientDetails>(
      `http://localhost:9000/api/medical/hopitaux/${user.hopital.id}/patients-orthanc/${patientId}/details`
    )
    
    patientDetails.value = response
    console.log('✅ Détails chargés:', response)
    
  } catch (err) {
    console.error('❌ Erreur lors du chargement des détails:', err)
    detailsError.value = 'Erreur lors du chargement des détails du patient'
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger les détails du patient',
      color: 'error'
    })
  } finally {
    isLoadingDetails.value = false
  }
}

// Fonction pour afficher les détails d'une étude
const showStudyDetails = (studyId: string) => {
  // Si on n'a pas encore chargé les détails du patient
  if (!patientDetails.value) {
    console.log('🔍 Chargement des détails du patient avant de montrer l\'étude')
    loadPatientDetails(selectedPatient.value?.id || '').then(() => {
      findAndShowStudy(studyId)
    })
  } else {
    findAndShowStudy(studyId)
  }
}

// Fonction utilitaire pour trouver et afficher une étude
const findAndShowStudy = (studyId: string) => {
  if (!patientDetails.value) return
  
  const foundStudy = patientDetails.value.studies.find(study => study.id === studyId)
  
  if (foundStudy) {
    console.log('✅ Étude trouvée:', foundStudy.studyDescription || studyId)
    selectedStudy.value = foundStudy
    isStudyDetailsOpen.value = true
  } else {
    console.error('❌ Étude non trouvée:', studyId)
    toast.add({
      title: 'Erreur',
      description: 'Étude non trouvée',
      color: 'error'
    })
  }
}

function getRowItems(row: any) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copier ID patient',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.patientId)
        toast.add({
          title: 'Copié',
          description: 'ID patient copié dans le presse-papier'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Voir études DICOM',
      icon: 'i-lucide-file-image'
    },
    {
      label: 'Voir détails',
      icon: 'i-lucide-info'
    }
  ]
}

const columns: any[] = [
  {
    id: 'select',
    header: ({ table }: any) =>
      h(resolveComponent('UCheckbox'), {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }: any) =>
      h(resolveComponent('UCheckbox'), {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    accessorKey: 'patientId',
    header: 'ID Patient'
  },
  {
    accessorKey: 'patientName',
    header: 'Patient',
    cell: ({ row }: any) => {
      return h('div', { class: 'min-w-0 flex-1' }, [
        h('p', { class: 'font-medium text-gray-900 truncate' }, row.original.patientName || 'Anonyme'),
        h('p', { class: 'text-xs text-gray-500 truncate' }, `ID: ${row.original.patientId}`)
      ])
    }
  },
  {
    accessorKey: 'patientSex',
    header: 'Sexe',
    cell: ({ row }: any) => {
      const sex = row.original.patientSex
      const sexLabel = sex === 'M' ? 'M' : sex === 'F' ? 'F' : '-'
      return h('span', { class: 'text-sm' }, sexLabel)
    }
  },
  {
    accessorKey: 'patientBirthDate',
    header: 'Naissance',
    cell: ({ row }: any) => {
      const birthDate = row.original.patientBirthDate
      if (!birthDate) return h('span', { class: 'text-xs text-gray-400' }, '-')
      // Format DICOM date (YYYYMMDD) vers format compact
      if (birthDate.length === 8) {
        const year = birthDate.substring(2, 4) // YY au lieu de YYYY
        const month = birthDate.substring(4, 6)
        const day = birthDate.substring(6, 8)
        return h('span', { class: 'text-xs' }, `${day}/${month}/${year}`)
      }
      return h('span', { class: 'text-xs' }, birthDate)
    }
  },
  {
    accessorKey: 'studies',
    header: 'Études',
    cell: ({ row }: any) => {
      const studiesCount = row.original.studies.length
      return h('span', { 
        class: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${studiesCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}` 
      }, studiesCount.toString())
    }
  },
  {
    accessorKey: 'stable',
    header: 'Statut',
    cell: ({ row }: any) => {
      const isStable = row.original.stable
      const status = isStable ? 'OK' : '⚠'
      const color = isStable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      return h('span', { class: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}` }, status)
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }: any) => {
      return h('div', { class: 'text-right flex gap-1' }, [
        h('button', {
          class: 'inline-flex items-center px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors',
          onClick: () => {
            console.log('�️ Clic sur voir détails du patient')
            openPatientDetails(row.original)
          },
          title: 'Voir les détails'
        }, '👁️'),
        h('button', {
          class: 'inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors',
          onClick: () => {
            navigator.clipboard.writeText(row.original.patientId)
            toast.add({
              title: 'Copié',
              description: 'ID patient copié'
            })
          },
          title: 'Copier ID'
        }, '📋')
      ])
    }
  }
]

const statusFilter = ref('all')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="patients-orthanc">
    <template #header>
      <UDashboardNavbar title="Patients Orthanc - Imagerie Médicale">
        <template #subtitle>
          <div class="flex gap-4">
            <span v-if="hopitalNom">Hôpital : <b>{{ hopitalNom }}</b></span>
            <span>Patients d'imagerie : <b>{{ nombrePatientsOrthanc }}</b></span>
            <span>Total études : <b>{{ nombreEtudesTotal }}</b></span>
          </div>
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Section de test pour la navigation -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-yellow-800 mb-2">🧪 Tests de Navigation</h3>
        <div class="flex gap-2 flex-wrap">
          <button 
            @click="() => navigateTo('/test-navigation')"
            class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Page de test navigation
          </button>
          <button 
            @click="() => navigateTo('/orthanc/patients/test')"
            class="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
          >
            Test page simple
          </button>
          <button 
            @click="() => navigateTo('/orthanc/patients/test-123')"
            class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Test patient (navigateTo)
          </button>
          <button 
            @click="() => $router.push('/orthanc/patients/test-456')"
            class="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
          >
            Test patient (router.push)
          </button>
          <a 
            href="/orthanc/patients/test-789"
            class="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 no-underline"
          >
            Test patient (lien HTML)
          </a>
        </div>
      </div>

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
        <p class="text-red-700">{{ error }}</p>
        <button 
          @click="fetchOrthancPatients"
          class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>

      <div v-else-if="status === 'pending'" class="p-4 text-center">
        <p>Chargement des patients Orthanc...</p>
      </div>

      <div v-else class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <UInput
            :model-value="String(table?.tableApi?.getColumn('patientName')?.getFilterValue() || '')"
            class="w-full sm:max-w-sm"
            icon="i-lucide-search"
            placeholder="Rechercher un patient..."
            @update:model-value="table?.tableApi?.getColumn('patientName')?.setFilterValue($event)"
          />

          <div class="flex flex-wrap items-center gap-2">
            <ClientOnly>
              <UButton
                v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
                color="primary"
                variant="subtle"
                icon="i-lucide-file-image"
                size="sm"
              >
                <span class="hidden sm:inline">Voir études</span>
                ({{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }})
              </UButton>
            </ClientOnly>
          </div>
        </div>

        <div class="overflow-x-auto">
          <ClientOnly>
            <UTable
              ref="table"
              v-model:column-filters="columnFilters"
              v-model:column-visibility="columnVisibility"
              v-model:row-selection="rowSelection"
              v-model:pagination="pagination"
              class="min-w-full"
              :data="patients"
              :columns="columns"
              :loading="status === 'pending'"
              :ui="{
                base: 'min-w-full table-auto',
                thead: 'bg-gray-50',
                tbody: '',
                th: 'px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap',
                td: 'px-3 py-2 whitespace-nowrap text-sm'
              }"
            />
            <template #fallback>
              <div class="p-4 text-center">
                <p>Chargement du tableau...</p>
              </div>
            </template>
          </ClientOnly>
        </div>

        <ClientOnly>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 pt-4">
            <div class="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
              {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
              {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
            </div>

            <div class="flex items-center justify-center sm:justify-end gap-1.5 order-1 sm:order-2">
              <UPagination
                :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="table?.tableApi?.getFilteredRowModel().rows.length"
                @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
                size="sm"
              />
            </div>
          </div>
          <template #fallback>
            <div class="border-t border-gray-200 pt-4">
              <p class="text-sm text-gray-600">Chargement de la pagination...</p>
            </div>
          </template>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Popup simple pleine page -->
  <div 
    v-if="isDetailModalOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="isDetailModalOpen = false"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 m-4 flex flex-col">
      <!-- Header avec titre et croix -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">
          Détails du Patient Orthanc
        </h2>
        <button 
          @click="isDetailModalOpen = false"
          class="text-gray-400 hover:text-gray-600 text-3xl leading-none"
        >
          ×
        </button>
      </div>

      <!-- Contenu scrollable -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="selectedPatient" class="space-y-8">
          
          <!-- Section Patient Info -->
          <div class="bg-blue-50 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-blue-900 mb-4">👤 Informations Patient</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Nom du patient</p>
                <p class="text-lg font-medium">{{ selectedPatient.patientName || 'Anonyme' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">ID Patient</p>
                <p class="text-lg font-medium font-mono">{{ selectedPatient.patientId }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Sexe</p>
                <p class="text-lg font-medium">{{ selectedPatient.patientSex || '-' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Date de naissance</p>
                <p class="text-lg font-medium">{{ selectedPatient.patientBirthDate || '-' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">ID Orthanc</p>
                <p class="text-sm font-mono text-gray-800">{{ selectedPatient.id }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Statut</p>
                <p class="text-lg font-medium" :class="selectedPatient.stable ? 'text-green-600' : 'text-yellow-600'">
                  {{ selectedPatient.stable ? '✅ Stable' : '⚠️ En traitement' }}
                </p>
              </div>
            </div>
          </div>

          <!-- État de chargement ou erreurs -->
          <div v-if="isLoadingDetails" class="bg-gray-50 p-6 rounded-lg text-center">
            <div class="flex justify-center mb-3">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p>Chargement des détails du patient...</p>
          </div>
          
          <div v-else-if="detailsError" class="bg-red-50 p-6 rounded-lg border border-red-200">
            <p class="text-red-700 mb-3">{{ detailsError }}</p>
            <button 
              @click="loadPatientDetails(selectedPatient.id)"
              class="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>

          <!-- Section Études (affichage en fonction des détails chargés) -->
          <div class="bg-green-50 rounded-lg p-6" v-if="!isLoadingDetails">
            <h3 class="text-xl font-semibold text-green-900 mb-4">
              🏥 Études DICOM ({{ patientDetails?.studies?.length || selectedPatient.studies.length }})
            </h3>
            
            <!-- Affichage détaillé des études -->
            <div v-if="patientDetails?.studies?.length > 0" class="space-y-2">
              <div 
                v-for="study in patientDetails.studies" 
                :key="study.id"
                class="bg-white p-4 rounded border flex flex-col md:flex-row md:items-center justify-between"
              >
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-md">{{ study.studyDescription || 'Étude' }}</span>
                    <span class="text-xs bg-gray-100 py-1 px-2 rounded">{{ study.series.length }} séries</span>
                  </div>
                  <p class="text-sm text-gray-600">
                    Date: {{ study.studyDate || 'Non spécifiée' }}
                    {{ study.studyTime ? ', ' + study.studyTime : '' }}
                  </p>
                  <p class="font-mono text-xs text-gray-500 mt-1">{{ study.id }}</p>
                </div>
                <button 
                  @click="showStudyDetails(study.id)" 
                  class="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 md:mt-0 mt-2"
                >
                  Voir détails
                </button>
              </div>
            </div>
            
            <!-- Affichage minimal des études en attendant les détails -->
            <div v-else-if="selectedPatient.studies.length > 0" class="space-y-2">
              <div 
                v-for="(studyId, index) in selectedPatient.studies" 
                :key="studyId"
                class="bg-white p-4 rounded border flex items-center justify-between"
              >
                <div>
                  <p class="text-sm text-gray-600">Étude {{ index + 1 }}</p>
                  <p class="font-mono text-sm">{{ studyId }}</p>
                </div>
                <button 
                  @click="showStudyDetails(studyId)" 
                  class="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                  Voir détails
                </button>
              </div>
            </div>
            <div v-else class="text-gray-500 text-center py-8">
              Aucune étude DICOM disponible
            </div>
          </div>

          <!-- Section Tags DICOM -->
          <div v-if="selectedPatient.mainDicomTags" class="bg-purple-50 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-purple-900 mb-4">🏷️ Tags DICOM Principaux</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="(value, key) in selectedPatient.mainDicomTags" 
                :key="key"
                class="bg-white p-4 rounded border"
              >
                <p class="text-sm text-gray-600">{{ key }}</p>
                <p class="font-medium">{{ value || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Section Informations techniques -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">⚙️ Informations Techniques</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Dernière mise à jour</p>
                <p class="font-medium">{{ selectedPatient.lastUpdate || '-' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Nombre total d'études</p>
                <p class="text-2xl font-bold text-blue-600">{{ selectedPatient.studies.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t bg-gray-50 rounded-b-lg">
        <div class="flex justify-end">
          <button 
            @click="isDetailModalOpen = false"
            class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal pour les détails d'une étude -->
  <div 
    v-if="isStudyDetailsOpen && selectedStudy" 
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50"
    @click.self="isStudyDetailsOpen = false"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 m-4 flex flex-col">
      <!-- Header avec titre et croix -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">
          Détails de l'Étude DICOM
        </h2>
        <button 
          @click="isStudyDetailsOpen = false"
          class="text-gray-400 hover:text-gray-600 text-3xl leading-none"
        >
          ×
        </button>
      </div>

      <!-- Contenu scrollable -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="space-y-8">
          
          <!-- Section Informations Étude -->
          <div class="bg-blue-50 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-blue-900 mb-4">📊 Informations de l'Étude</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Description</p>
                <p class="text-lg font-medium">{{ selectedStudy.studyDescription || 'Non spécifié' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Date de l'étude</p>
                <p class="text-lg font-medium">{{ selectedStudy.studyDate || '-' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Heure de l'étude</p>
                <p class="text-lg font-medium">{{ selectedStudy.studyTime || '-' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">ID Étude</p>
                <p class="text-sm font-mono text-gray-800">{{ selectedStudy.id }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">UID de l'instance d'étude</p>
                <p class="text-sm font-mono text-gray-800">{{ selectedStudy.studyInstanceUID }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Numéro d'accession</p>
                <p class="text-lg font-medium">{{ selectedStudy.accessionNumber || '-' }}</p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Statut</p>
                <p class="text-lg font-medium" :class="selectedStudy.stable ? 'text-green-600' : 'text-yellow-600'">
                  {{ selectedStudy.stable ? '✅ Stable' : '⚠️ En traitement' }}
                </p>
              </div>
              <div class="bg-white p-4 rounded border">
                <p class="text-sm text-gray-600">Dernière mise à jour</p>
                <p class="text-lg font-medium">{{ selectedStudy.lastUpdate || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Section Séries -->
          <div class="bg-green-50 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-green-900 mb-4">
              🔍 Séries DICOM ({{ selectedStudy.series?.length || 0 }})
            </h3>
            <div v-if="selectedStudy.series?.length > 0" class="space-y-4">
              <div 
                v-for="(series, index) in selectedStudy.series" 
                :key="series.id"
                class="bg-white p-4 rounded border"
              >
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-semibold text-lg">Série {{ series.seriesNumber || index + 1 }}</h4>
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {{ series.modality || 'N/A' }}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <p class="text-sm text-gray-600">Description</p>
                    <p class="font-medium">{{ series.seriesDescription || 'Non spécifié' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Partie du corps examinée</p>
                    <p class="font-medium">{{ series.bodyPartExamined || 'Non spécifié' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Nombre d'instances</p>
                    <p class="font-medium">{{ series.instancesCount }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">ID Série</p>
                    <p class="text-sm font-mono">{{ series.id }}</p>
                  </div>
                </div>
                
                <!-- Boutons d'action pour les séries -->
                <div class="mt-4 flex justify-end">
                  <button class="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm hover:bg-orange-200 mr-2">
                    Voir images
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 text-center py-8">
              Aucune série DICOM disponible
            </div>
          </div>

          <!-- Section Tags DICOM -->
          <div v-if="selectedStudy.studyMainDicomTags" class="bg-purple-50 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-purple-900 mb-4">🏷️ Tags DICOM Principaux</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="(value, key) in selectedStudy.studyMainDicomTags" 
                :key="key"
                class="bg-white p-4 rounded border"
              >
                <p class="text-sm text-gray-600">{{ key }}</p>
                <p class="font-medium">{{ value || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t bg-gray-50 rounded-b-lg">
        <div class="flex justify-end">
          <button 
            @click="isStudyDetailsOpen = false"
            class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
