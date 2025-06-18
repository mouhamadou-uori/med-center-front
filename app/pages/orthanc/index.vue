<template>
  <UContainer>
    <div class="space-y-6">
      <UPageHeader
        title="Orthanc Medical Imaging Server"
        description="View and manage Orthanc DICOM data"
        class="mb-6"
      >
        <template #right>
          <UButton
            icon="i-lucide-users"
            to="/orthanc/patients"
            label="Patients"
            color="primary"
            variant="soft"
            class="mr-2"
          />
          <UButton
            icon="i-lucide-bar-chart-2"
            to="/orthanc/statistics"
            label="Statistics"
            color="primary"
            variant="soft"
          />
        </template>
      </UPageHeader>

      <UCard class="mb-4">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium">Orthanc Dashboard</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Visualize and explore your medical imaging data
              </p>
            </div>
          </div>
        </template>

        <div v-if="pending">
          <USkeleton class="h-8 w-full mb-2" />
          <USkeleton class="h-32 w-full" />
        </div>
        <div v-else-if="error">
          <UAlert
            title="Error loading statistics"
            description="There was an error loading the Orthanc server statistics. Make sure you have ADMIN permissions."
            color="red"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard
            v-for="(stat, index) in dashboardStats"
            :key="index"
            :ui="{ base: 'relative overflow-hidden', body: 'p-4' }"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ stat.label }}
                </div>
                <div class="text-2xl font-bold mt-1">{{ stat.value }}</div>
              </div>
              <UIcon
                :name="stat.icon"
                class="text-gray-300 dark:text-gray-700 text-4xl"
              />
            </div>
          </UCard>
        </div>

        <template #footer>
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {{ lastUpdated }}
            </p>
            <UButton
              icon="i-lucide-refresh-cw"
              variant="ghost"
              @click="refreshData"
              :loading="pending"
            />
          </div>
        </template>
      </UCard>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">Quick Access</h3>
            </div>
          </template>
          <div class="space-y-2">
            <UButton
              block
              icon="i-lucide-users"
              to="/orthanc/patients"
              label="Browse Patients"
              color="gray"
              variant="ghost"
              class="justify-start"
            />
            <UButton
              block
              icon="i-lucide-folder"
              to="/orthanc/studies"
              label="View Studies"
              color="gray"
              variant="ghost"
              class="justify-start"
            />
            <UButton
              block
              icon="i-lucide-bar-chart-2"
              to="/orthanc/statistics"
              label="Server Statistics"
              color="gray"
              variant="ghost"
              class="justify-start"
            />
            <UButton
              block
              icon="i-lucide-cpu"
              to="/orthanc/system"
              label="System Information"
              color="gray"
              variant="ghost"
              class="justify-start"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">System Status</h3>
          </template>
          <div v-if="pending">
            <USkeleton class="h-6 w-full mb-2" v-for="i in 4" :key="i" />
          </div>
          <div v-else-if="systemError">
            <UAlert
              title="Error loading system information"
              description="Could not retrieve system information"
              color="red"
              variant="soft"
              icon="i-lucide-alert-triangle"
            />
          </div>
          <div v-else-if="systemInfo" class="space-y-3">
            <div v-for="(info, index) in systemInfoDisplay" :key="index" class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ info.label }}:</span>
              <span class="text-sm font-medium">{{ info.value }}</span>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true
})
import { useOrthancService, type OrthancStatistics, type OrthancSystemInfo } from '~/services/orthanc'

const orthancService = useOrthancService()
const { data: statistics, pending, error, refresh } = await orthancService.fetchStatistics()
const { data: systemInfo, error: systemError } = await orthancService.fetchSystemInfo()

const lastUpdated = ref(new Date().toLocaleString())

const refreshData = async () => {
  await refresh()
  lastUpdated.value = new Date().toLocaleString()
}

const dashboardStats = computed(() => {
  if (!statistics.value) return []

  return [
    {
      label: 'Patients',
      value: statistics.value.CountPatients.toLocaleString(),
      icon: 'i-lucide-users'
    },
    {
      label: 'Studies',
      value: statistics.value.CountStudies.toLocaleString(),
      icon: 'i-lucide-folder'
    },
    {
      label: 'Series',
      value: statistics.value.CountSeries.toLocaleString(),
      icon: 'i-lucide-layers'
    }
  ]
})

const systemInfoDisplay = computed(() => {
  if (!systemInfo.value) return []

  return [
    {
      label: 'Version',
      value: systemInfo.value.Version
    },
    {
      label: 'DICOM AET',
      value: systemInfo.value.DicomAet
    },
    {
      label: 'DICOM Port',
      value: systemInfo.value.DicomPort
    },
    {
      label: 'Storage Compression',
      value: systemInfo.value.StorageCompression ? 'Enabled' : 'Disabled'
    }
  ]
})
</script>
