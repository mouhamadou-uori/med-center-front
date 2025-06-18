<script setup>
// Version simplifiée sans TypeScript strict
definePageMeta({
  requiresAuth: false // Permettre l'accès sans authentification pour voir les statistiques de test
})

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New patient',
  icon: 'i-lucide-user-plus',
  to: '/patients'
}, {
  label: 'Medical imaging',
  icon: 'i-lucide-heart-pulse',
  to: '/orthanc'
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
      <UDashboardNavbar title="Accueil" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            to="/orthanc"
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
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
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
