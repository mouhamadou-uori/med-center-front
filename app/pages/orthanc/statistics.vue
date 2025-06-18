<template>
  <UContainer>
    <UPageHeader
      title="Orthanc Statistics"
      description="Server statistics and system information"
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
        <UButton
          :loading="pending || systemPending"
          icon="i-lucide-refresh-cw"
          variant="ghost"
          @click="refreshData"
        />
      </template>
    </UPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <UCard
        v-for="(stat, index) in dashboardStats"
        :key="index"
        :ui="{ base: 'relative overflow-hidden h-full', body: 'p-5' }"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ stat.label }}
            </div>
            <div class="text-3xl font-bold mt-1">
              {{ stat.value }}
            </div>
          </div>
          <UIcon
            :name="stat.icon"
            class="text-gray-300 dark:text-gray-700 text-5xl"
          />
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <!-- Server Statistics -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">
              Server Statistics
            </h3>
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
            title="Error loading statistics"
            description="There was an error loading the server statistics. Make sure you have ADMIN permissions."
            color="red"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>

        <div v-else-if="!statistics">
          <UAlert
            title="No statistics available"
            description="Could not retrieve statistics from the Orthanc server"
            color="yellow"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(stat, index) in serverStatistics"
              :key="index"
              class="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ stat.label }}
              </span>
              <span class="font-medium text-lg mt-1">
                {{ stat.value }}
              </span>
            </div>
          </div>
        </div>

        <template v-if="statistics" #footer>
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Uptime: {{ statistics.Uptime }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Version: {{ statistics.Version }}
            </p>
          </div>
        </template>
      </UCard>

      <!-- System Information -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">System Information</h3>
          </div>
        </template>

        <div v-if="systemPending">
          <USkeleton class="h-8 w-full mb-2" v-for="i in 4" :key="i" />
        </div>
        <div v-else-if="systemError">
          <UAlert
            title="Error loading system information"
            description="There was an error loading the Orthanc system information. Make sure you have ADMIN permissions."
            color="red"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>
        <div v-else-if="!systemInfo">
          <UAlert
            title="No system information available"
            description="System information is not available from the Orthanc server"
            color="yellow"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>
        <div v-else>
          <div class="mb-4">
            <h4 class="text-base font-medium mb-2">Server Configuration</h4>
            <div class="space-y-2">
              <div v-for="(info, index) in serverConfigData" :key="index" class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ info.label }}</span>
                <span class="text-sm font-medium">{{ info.value }}</span>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h4 class="text-base font-medium mb-2">Plugins</h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="plugin in systemInfo.PluginsEnabled"
                :key="plugin"
                color="blue"
                variant="subtle"
              >
                {{ plugin }}
              </UBadge>
              <p v-if="!systemInfo.PluginsEnabled || systemInfo.PluginsEnabled.length === 0" class="text-sm text-gray-500">
                No plugins enabled
              </p>
            </div>
          </div>

          <div>
            <h4 class="text-base font-medium mb-2">Memory Usage</h4>
            <div class="space-y-2">
              <div v-for="(info, index) in memoryData" :key="index" class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ info.label }}</span>
                <span class="text-sm font-medium">{{ info.value }} MB</span>
              </div>
            </div>
          </div>
        </div>

        <template v-if="systemInfo" #footer>
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Storage Compression: {{ systemInfo.StorageCompression ? 'Enabled' : 'Disabled' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Version: {{ systemInfo.Version }}
            </p>
          </div>
        </template>
      </UCard>

      <!-- Storage Usage Chart -->
      <UCard class="col-span-1 md:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Storage Usage</h3>
          </div>
        </template>

        <div v-if="pending">
          <USkeleton class="h-60 w-full" />
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
        <div v-else-if="!statistics">
          <UAlert
            title="No statistics available"
            description="Statistics data is not available from the Orthanc server"
            color="yellow"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>
        <div v-else class="h-60">
          <div class="flex items-center justify-center h-full">
            <div class="w-full max-w-md">
              <div class="flex flex-col items-center">
                <div class="relative w-60 h-60">
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-3xl font-bold">{{ diskUsagePercent }}%</div>
                      <div class="text-sm text-gray-500">used</div>
                    </div>
                  </div>
                  <div class="absolute inset-0 rounded-full overflow-hidden">
                    <div class="h-full bg-gray-200 dark:bg-gray-700"></div>
                    <div
                      class="absolute top-0 left-0 h-full bg-primary-500"
                      :style="`width: ${diskUsagePercent}%`"
                    ></div>
                  </div>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span class="text-sm">Used: {{ statistics.TotalDiskSizeMB - statistics.FreeDiskSizeMB }} MB</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <span class="text-sm">Free: {{ statistics.FreeDiskSizeMB }} MB</span>
                  </div>
                  <div class="flex items-center gap-2 col-span-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="text-sm">Total: {{ statistics.TotalDiskSizeMB }} MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true
})
import { useOrthancService } from '~/services/orthanc'

const orthancService = useOrthancService()
const { data: statistics, pending, error, refresh } = await orthancService.fetchStatistics()
const { data: systemInfo, pending: systemPending, error: systemError, refresh: refreshSystem } = await orthancService.fetchSystemInfo()

const refreshData = async () => {
  await Promise.all([refresh(), refreshSystem()])
}

const formatSize = (sizeInMB: number): string => {
  if (sizeInMB < 1024) {
    return `${sizeInMB.toLocaleString()} MB`
  } else {
    return `${(sizeInMB / 1024).toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`
  }
}

const formatMemorySize = (sizeBytes: number): string => {
  if (sizeBytes < 1024) {
    return `${sizeBytes} bytes`
  } else if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(2)} KB`
  } else if (sizeBytes < 1024 * 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
  } else {
    return `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
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

const serverStatistics = computed(() => {
  if (!statistics.value) return []

  return [
    {
      label: 'Total Instances',
      value: statistics.value.CountInstances.toLocaleString()
    },
    {
      label: 'DICOM AET',
      value: statistics.value.DicomAet
    },
    {
      label: 'DICOM Port',
      value: statistics.value.DicomPort
    },
    {
      label: 'HTTP Port',
      value: statistics.value.HttpPort
    },
    {
      label: 'Version',
      value: statistics.value.Version
    },
    {
      label: 'Uptime',
      value: statistics.value.Uptime
    }
  ]
})

const serverConfigData = computed(() => {
  if (!systemInfo.value) return []

  return [
    {
      label: 'Server Name',
      value: systemInfo.value.Name
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
      label: 'HTTP Port',
      value: systemInfo.value.HttpPort
    },
    {
      label: 'Storage Size',
      value: formatSize(systemInfo.value.StorageDirectorySize)
    },
    {
      label: 'Database Version',
      value: systemInfo.value.DatabaseVersion
    }
  ]
})

const memoryData = computed(() => {
  if (!systemInfo.value || !systemInfo.value.MemoryStatistics) return []

  const stats = systemInfo.value.MemoryStatistics
  return [
    {
      label: 'Working Set',
      value: formatMemorySize(stats.WorkingSetSize)
    },
    {
      label: 'Peak Working Set',
      value: formatMemorySize(stats.PeakWorkingSetSize)
    },
    {
      label: 'Paged Pool',
      value: formatMemorySize(stats.PagedPool)
    },
    {
      label: 'Non-Paged Pool',
      value: formatMemorySize(stats.NonPagedPool)
    }
  ]
})

const diskUsagePercent = computed(() => {
  if (!statistics.value) return 0

  const { TotalDiskSizeMB, FreeDiskSizeMB } = statistics.value
  if (TotalDiskSizeMB === 0) return 0

  const usedPercent = Math.round(((TotalDiskSizeMB - FreeDiskSizeMB) / TotalDiskSizeMB) * 100)
  return usedPercent
})
</script>