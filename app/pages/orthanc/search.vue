<template>
  <UContainer>
    <UPageHeader
      title="Image Search"
      description="Search for DICOM images across all patients and studies"
    >
      <template #right>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          @click="handleSearch"
          :loading="pending"
        />
      </template>
    </UPageHeader>

    <UCard>
      <template #header>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <UInput
              v-model="searchQuery.PatientName"
              placeholder="Patient Name..."
              icon="i-lucide-user"
              class="flex-1"
            />
            <UInput
              v-model="searchQuery.StudyDescription"
              placeholder="Study Description..."
              icon="i-lucide-file-text"
              class="flex-1"
            />
            <UInput
              v-model="searchQuery.Modality"
              placeholder="Modality (CT, MR, etc)..."
              icon="i-lucide-radio"
              class="w-48"
            />
          </div>
          <div class="flex items-center gap-4">
            <UInput
              v-model="searchQuery.StudyDate"
              type="date"
              icon="i-lucide-calendar"
              class="w-48"
            />
            <UButton
              color="primary"
              @click="handleSearch"
              :loading="pending"
              class="ml-auto"
            >
              Search
            </UButton>
          </div>
        </div>
      </template>

      <div v-if="pending">
        <USkeleton class="h-48 w-full mb-2" v-for="i in 3" :key="i" />
      </div>

      <div v-else-if="error">
        <UAlert
          title="Error searching images"
          :description="error"
          color="red"
          variant="soft"
          icon="i-lucide-alert-triangle"
        />
      </div>

      <div v-else-if="!searchResults.length">
        <UAlert
          :title="hasSearched ? 'No results found' : 'Start searching'"
          :description="hasSearched ? 'Try adjusting your search criteria' : 'Use the search form above to find DICOM images'"
          color="blue"
          variant="soft"
          icon="i-lucide-info"
        />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="result in searchResults" :key="result.ID" class="flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-medium truncate">
                {{ result.MainDicomTags?.StudyDescription || 'Unnamed Study' }}
              </h3>
              <UBadge color="primary" variant="subtle">
                {{ result.MainDicomTags?.Modality || 'Unknown' }}
              </UBadge>
            </div>
          </template>

          <div class="flex-1">
            <img
              v-if="result.previewUrl"
              :src="result.previewUrl"
              :alt="result.MainDicomTags?.StudyDescription"
              class="w-full h-48 object-cover bg-gray-100 dark:bg-gray-800"
            />
            <div v-else class="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <UIcon name="i-lucide-image" class="text-4xl text-gray-400" />
            </div>

            <div class="mt-4 space-y-2">
              <p class="text-sm">
                <span class="font-medium">Patient:</span>
                {{ result.MainDicomTags?.PatientName || 'Unknown' }}
              </p>
              <p class="text-sm">
                <span class="font-medium">Date:</span>
                {{ formatDate(result.MainDicomTags?.StudyDate) }}
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                icon="i-lucide-eye"
                color="gray"
                variant="ghost"
                :to="`/orthanc/studies/${result.ID}`"
                title="View study details"
              />
              <UButton
                icon="i-lucide-download"
                color="primary"
                variant="ghost"
                @click="downloadStudy(result.ID)"
                title="Download study archive"
                :loading="downloading === result.ID"
              />
            </div>
          </template>
        </UCard>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true
})
import { format } from 'date-fns'
import { useOrthancService } from '~/services/orthanc'

const orthancService = useOrthancService()

interface SearchQuery {
  PatientName?: string
  StudyDescription?: string
  Modality?: string
  StudyDate?: string
}

const searchQuery = ref<SearchQuery>({})
const searchResults = ref<any[]>([])
const pending = ref(false)
const error = ref('')
const hasSearched = ref(false)
const downloading = ref('')

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

const handleSearch = async () => {
  pending.value = true
  error.value = ''
  
  try {
    // Build query object, removing empty values
    const query = Object.entries(searchQuery.value).reduce((acc, [key, value]) => {
      if (value) acc[key] = value
      return acc
    }, {} as SearchQuery)

    if (Object.keys(query).length === 0) {
      error.value = 'Please enter at least one search criteria'
      return
    }

    const { data, error: searchError } = await orthancService.searchDicom({
      Level: 'Study',
      Query: query
    })

    if (searchError.value) {
      throw new Error('Failed to search images')
    }

    searchResults.value = data.value || []
    hasSearched.value = true

    // Load preview images for each result
    for (const result of searchResults.value) {
      if (result.ID) {
        try {
          const { data: preview } = await orthancService.getInstancePreview(result.ID)
          if (preview.value) {
            result.previewUrl = URL.createObjectURL(preview.value)
          }
        } catch (e) {
          console.error('Failed to load preview for study:', result.ID)
        }
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
    searchResults.value = []
  } finally {
    pending.value = false
  }
}

const downloadStudy = async (studyId: string) => {
  downloading.value = studyId
  try {
    const { data, error: downloadError } = await orthancService.downloadStudyArchive(studyId)
    
    if (downloadError.value) {
      throw new Error('Failed to download study archive')
    }

    if (data.value) {
      // Create a download link
      const url = URL.createObjectURL(data.value)
      const link = document.createElement('a')
      link.href = url
      link.download = `study-${studyId}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to download study'
  } finally {
    downloading.value = ''
  }
}

// Cleanup object URLs when component is destroyed
onBeforeUnmount(() => {
  for (const result of searchResults.value) {
    if (result.previewUrl) {
      URL.revokeObjectURL(result.previewUrl)
    }
  }
})
</script>
