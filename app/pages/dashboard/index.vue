<script setup>
// Version simplifiée sans TypeScript strict
definePageMeta({
  requiresAuth: true // Accessible uniquement aux utilisateurs authentifiés
})

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/dashboard/inbox'
}, {
  label: 'New patient',
  icon: 'i-lucide-user-plus',
  to: '/dashboard/patients'
}, {
  label: 'Medical imaging',
  icon: 'i-lucide-heart-pulse',
  to: '/dashboard/orthanc'
}]]

// Données simplifiées pour éviter les erreurs de date
const twoWeeksAgo = new Date()
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
const now = new Date()

const range = shallowRef({
  start: twoWeeksAgo.toISOString(),
  end: now.toISOString()
})
const period = ref('today')
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Tableau de bord" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            to="/dashboard/orthanc"
            icon="i-lucide-heart-pulse"
            color="primary"
            variant="soft"
            label="Imagerie Médicale"
            class="mr-2"
          />

          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <HomeDateRangePicker v-model="range" class="-ms-1" />
          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" />
      <HomeSales :period="period" :range="range" />
    </template>
  </UDashboardPanel>
</template>
