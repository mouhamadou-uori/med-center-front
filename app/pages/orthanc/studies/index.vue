<template>
  <UContainer>
    <UPageHeader
      title="Studies"
      description="View all studies stored in the Orthanc server"
    >
      <template #left>
        <UButton
          icon="i-lucide-arrow-left"
          to="/orthanc"
          variant="ghost"
          class="mr-2"
        />
      </template>
      <template #right>
        <UInput
          v-model="search"
          placeholder="Search studies..."
          icon="i-lucide-search"
          class="w-full md:w-60"
        />
      </template>
    </UPageHeader>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Studies List</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ filteredStudies.length }} studies found
            </p>
          </div>
          <UButton
            icon="i-lucide-refresh-cw"
            variant="ghost"
            @click="refreshData"
            :loading="pending"
          />
        </div>
      </template>

      <div v-if="pending">
        <USkeleton class="h-12 w-full mb-2" v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="error">
        <UAlert
          title="Error loading studies"
          description="There was an error loading the studies list. Make sure you have ADMIN permissions."
          color="red"
          variant="soft"
          icon="i-lucide-alert-triangle"
        />
      </div>

      <div v-else-if="!studies || studies.length === 0">
        <UAlert
          title="No studies found"
          description="There are no studies stored in the Orthanc server"
          color="blue"
          variant="soft"
          icon="i-lucide-info"
        />
      </div>

      <UTable v-else :columns="columns" :rows="paginatedStudies">
        <template #study-date-data="{ row }">
          {{ formatDate(row.MainDicomTags.StudyDate) }}
        </template>

        <template #description-data="{ row }">
          <NuxtLink :to="`/orthanc/studies/${row.ID}`" class="text-primary-500 hover:underline">
            {{ row.MainDicomTags.StudyDescription || 'No description' }}
          </NuxtLink>
        </template>

        <template #patient-name-data="{ row }">
          <NuxtLink :to="`/orthanc/patients/${row.ParentPatient}`" class="hover:underline">
            {{ row.PatientMainDicomTags.PatientName || 'Unnamed Patient' }}
          </NuxtLink>
        </template>

        <template #study-id-data="{ row }">
          <UBadge color="gray" variant="subtle">
            {{ row.MainDicomTags.StudyID || 'No ID' }}
          </UBadge>
        </template>

        <template #series-count-data="{ row }">
          <UBadge :color="row.Series.length > 0 ? 'blue' : 'gray'" variant="subtle">
            {{ row.Series.length }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UButton
            icon="i-lucide-eye"
            color="primary"
            variant="ghost"
            :to="`/orthanc/studies/${row.ID}`"
            title="View study details"
          />
        </template>

        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6">
            <UIcon name="i-lucide-folder-x" class="text-4xl mb-2 text-gray-400" />
            <p class="text-sm text-gray-500 dark:text-gray-400">No studies found matching your search</p>
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {{ lastUpdated }}
          </p>
          <div v-if="studies && studies.length > 0" class="flex space-x-2">
            <UPagination
              v-model="page"
              :page-count="totalPages"
              :total="filteredStudies.length"
              :ui="{ wrapper: 'flex items-center gap-1' }"
            />
            <USelect
              v-model="pageSize"
              :options="[10, 25, 50, 100]"
              option-attribute="value"
              class="w-20"
            />
          </div>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useOrthancService, type OrthancStudy } from '~/services/orthanc'

// Fetch studies directly
const orthancService = useOrthancService()
const { data: studies, pending, error, refresh } = await orthancService.fetchStudies()

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const lastUpdated = ref(new Date().toLocaleString())

const refreshData = async () => {
  await refresh()
  lastUpdated.value = new Date().toLocaleString()
}

const columns = [
  {
    key: 'study-date',
    label: 'Date',
    sortable: true
  },
  {
    key: 'description',
    label: 'Description',
    sortable: true
  },
  {
    key: 'patient-name',
    label: 'Patient',
    sortable: true
  },
  {
    key: 'study-id',
    label: 'Study ID',
    sortable: true
  },
  {
    key: 'series-count',
    label: 'Series',
    sortable: true
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false
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

const filteredStudies = computed(() => {
  if (!studies.value) return []

  let result = [...studies.value]

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(study => {
      return (
        (study.MainDicomTags.StudyDescription?.toLowerCase().includes(searchLower)) ||
        (study.MainDicomTags.StudyID?.toLowerCase().includes(searchLower)) ||
        (study.PatientMainDicomTags.PatientName?.toLowerCase().includes(searchLower))
      )
    })
  }

  return result
})

const paginatedStudies = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value

  return filteredStudies.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredStudies.value.length / pageSize.value)
})

watch(search, () => {
  // Reset to first page when filter changes
  page.value = 1
})

watch(pageSize, () => {
  // Reset to first page when page size changes
  page.value = 1
})
</script>
