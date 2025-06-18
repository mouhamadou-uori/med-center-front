<template>
  <UContainer>
    <UPageHeader
      :title="studyTitle"
      :description="studyDescription"
    >
      <template #left>
        <UButton
          v-if="study"
          icon="i-lucide-arrow-left"
          :to="`/orthanc/patients/${study.ParentPatient}`"
          variant="ghost"
          class="mr-2"
        />
        <UButton
          v-else
          icon="i-lucide-arrow-left"
          to="/orthanc/patients"
          variant="ghost"
          class="mr-2"
        />
      </template>
      <template #right>
        <UButton
          :loading="pending || seriesPending"
          icon="i-lucide-refresh-cw"
          variant="ghost"
          @click="refreshData"
        />
      </template>
    </UPageHeader>

    <div class="grid grid-cols-1 gap-6">
      <!-- Study Information Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">
              Study Information
            </h3>
            <UButton
              v-if="study"
              icon="i-lucide-user"
              :to="`/orthanc/patients/${study.ParentPatient}`"
              variant="ghost"
              color="primary"
            >
              View Patient
            </UButton>
          </div>
        </template>

        <div v-if="pending">
          <USkeleton
            v-for="i in 5"
            :key="i"
            class="h-6 w-full mb-2"
          />
        </div>

        <div v-else-if="error">
          <UAlert
            title="Error loading study"
            description="There was an error loading the study details. Make sure you have ADMIN permissions."
            color="red"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>

        <div v-else-if="!study">
          <UAlert
            title="Study not found"
            description="The requested study could not be found"
            color="yellow"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-6">
            <h4 class="text-base font-medium">Study Details</h4>
            <div 
              v-for="(field, index) in studyFields"
              :key="index"
              class="flex flex-col"
            >
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ field.label }}</span>
              <span class="font-medium">{{ field.value }}</span>
            </div>
          </div>

          <div class="space-y-6">
            <h4 class="text-base font-medium">Patient Details</h4>
            <div 
              v-for="(field, index) in patientFields"
              :key="index"
              class="flex flex-col"
            >
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ field.label }}</span>
              <span class="font-medium">{{ field.value }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Series Section -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium">Series</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ series?.length || 0 }} series found
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UInput
                v-model="seriesSearch"
                icon="i-lucide-search"
                placeholder="Search series..."
                size="sm"
                class="w-64"
              />
            </div>
          </div>
        </template>

        <div v-if="seriesPending">
          <USkeleton
            v-for="i in 4"
            :key="i"
            class="h-6 w-full mb-2"
          />
        </div>

        <div v-else-if="seriesError">
          <UAlert
            title="Error loading series"
            description="There was an error loading the series. Make sure you have ADMIN permissions."
            color="red"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>

        <div v-else-if="!series || series.length === 0">
          <UAlert
            title="No series found"
            description="This study does not have any series"
            color="blue"
            variant="soft"
            icon="i-lucide-info"
          />
        </div>

        <UTable v-else :columns="seriesColumns" :rows="filteredSeries">
          <template #series-number-data="{ row }">
            <UBadge color="gray" variant="subtle">
              {{ row.MainDicomTags.SeriesNumber || 'N/A' }}
            </UBadge>
          </template>

          <template #description-data="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">
                {{ row.MainDicomTags.SeriesDescription || 'Unnamed Series' }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Series ID: {{ row.ID }}
              </span>
            </div>
          </template>

          <template #modality-data="{ row }">
            <UBadge color="primary" variant="subtle">
              {{ row.MainDicomTags.Modality || 'N/A' }}
            </UBadge>
          </template>

          <template #date-data="{ row }">
            {{ formatDate(row.MainDicomTags.SeriesDate) }}
          </template>

          <template #instances-data="{ row }">
            <UBadge color="gray" variant="subtle">
              {{ row.Instances?.length || 0 }}
            </UBadge>
          </template>

          <template #actions-data="{ row }">
            <UButton
              icon="i-lucide-image"
              :to="`/orthanc/series/${row.ID}`"
              variant="ghost"
              color="gray"
            >
              View Images
            </UButton>
          </template>

          <template #empty>
            <div class="text-center py-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                No series found matching your search
              </p>
            </div>
          </template>
        </UTable>

        <template #footer v-if="series && series.length > 0">
          <UPagination
            v-model="seriesPage"
            :page-count="seriesPageSize"
            :total="filteredSeries.length"
          />
        </template>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useOrthancService } from '~/services/orthanc'

const route = useRoute()
const studyId = route.params.id as string

const orthancService = useOrthancService()
const { data: study, pending, error, refresh } = await orthancService.fetchStudy(studyId)
const { data: series, pending: seriesPending, error: seriesError, refresh: refreshSeries } = await orthancService.fetchStudySeries(studyId)

const seriesSearch = ref('')
const seriesPage = ref(1)
const seriesPageSize = ref(10)

const refreshData = async () => {
  await Promise.all([refresh(), refreshSeries()])
}

const studyTitle = computed(() => {
  if (!study.value) return 'Study Details'
  return study.value.MainDicomTags.StudyDescription || 'Unnamed Study'
})

const studyDescription = computed(() => {
  if (!study.value) return ''
  return `Study ID: ${study.value.MainDicomTags.StudyID || 'Unknown'}`
})

const studyFields = computed(() => {
  if (!study.value) return []

  const tags = study.value.MainDicomTags

  return [
    {
      label: 'Study Description',
      value: tags.StudyDescription || 'Unknown'
    },
    {
      label: 'Study ID',
      value: tags.StudyID || 'Unknown'
    },
    {
      label: 'Study Date',
      value: formatDate(tags.StudyDate) || 'Unknown'
    },
    {
      label: 'Accession Number',
      value: tags.AccessionNumber || 'Unknown'
    },
    {
      label: 'Series Count',
      value: study.value.Series.length
    },
    {
      label: 'Last Update',
      value: new Date(study.value.LastUpdate).toLocaleString()
    }
  ]
})

const patientFields = computed(() => {
  if (!study.value) return []

  const tags = study.value.PatientMainDicomTags

  return [
    {
      label: 'Patient Name',
      value: tags.PatientName || 'Unknown'
    },
    {
      label: 'Patient ID',
      value: tags.PatientID || 'Unknown'
    },
    {
      label: 'Birth Date',
      value: formatDate(tags.PatientBirthDate) || 'Unknown'
    },
    {
      label: 'Gender',
      value: formatGender(tags.PatientSex) || 'Unknown'
    }
  ]
})

const seriesColumns = [
  {
    key: 'series-number',
    label: '#',
    sortable: true
  },
  {
    key: 'description',
    label: 'Description',
    sortable: true
  },
  {
    key: 'modality',
    label: 'Modality',
    sortable: true
  },
  {
    key: 'instances',
    label: 'Instances',
    sortable: true
  },
  {
    key: 'date',
    label: 'Date',
    sortable: true
  },
  {
    key: 'actions',
    label: 'Actions'
  }
]

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown'

  try {
    // DICOM dates are in YYYYMMDD format
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)

    return format(new Date(`${year}-${month}-${day}`), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

const formatGender = (gender?: string) => {
  if (!gender) return 'Unknown'

  switch (gender.toUpperCase()) {
    case 'M': return 'Male'
    case 'F': return 'Female'
    case 'O': return 'Other'
    default: return gender
  }
}

const filteredSeries = computed(() => {
  if (!series.value) return []

  let result = [...series.value]

  if (seriesSearch.value) {
    const searchLower = seriesSearch.value.toLowerCase()
    result = result.filter(series => {
      return (
        (series.MainDicomTags.SeriesDescription?.toLowerCase().includes(searchLower)) ||
        (series.MainDicomTags.SeriesNumber?.toLowerCase().includes(searchLower)) ||
        (series.MainDicomTags.Modality?.toLowerCase().includes(searchLower))
      )
    })
  }

  const start = (seriesPage.value - 1) * seriesPageSize.value
  const end = start + seriesPageSize.value

  return result.slice(start, end)
})

const totalSeriesPages = computed(() => {
  if (!series.value) return 1
  return Math.ceil(series.value.length / seriesPageSize.value)
})

watch(seriesSearch, () => {
  // Reset to first page when filter changes
  seriesPage.value = 1
})
</script>