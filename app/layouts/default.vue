<script setup lang="ts">
const route = useRoute()

const open = ref(false)

const links = [[{
  label: 'Accueil',
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Inbox',
  icon: 'i-lucide-inbox',
  to: '/inbox',
  badge: '4',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Patients',
  icon: 'i-lucide-users',
  to: '/patients',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Imagerie Médicale',
  icon: 'i-lucide-image',
  defaultOpen: false,
  children: [{
    label: 'Tableau de bord',
    to: '/imagerie',
    icon: 'i-lucide-layout-dashboard',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Explorer patients',
    to: '/imagerie/patients',
    icon: 'i-lucide-users',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Rapports',
    to: '/imagerie/rapports',
    icon: 'i-lucide-clipboard-list',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Téléchargement',
    to: '/imagerie/download',
    icon: 'i-lucide-download',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Paramètres',
  to: '/settings',
  icon: 'i-lucide-settings',
  defaultOpen: true,
  children: [{
    label: 'Général',
    to: '/settings',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Membres',
    to: '/settings/members',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Notifications',
    to: '/settings/notifications',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Sécurité',
    to: '/settings/security',
    onSelect: () => {
      open.value = false
    }
  }]
}], [{
  label: 'Feedback',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/nuxt-ui-pro/dashboard',
  target: '_blank'
}, {
  label: 'Help & Support',
  icon: 'i-lucide-info',
  to: 'https://github.com/nuxt/ui-pro',
  target: '_blank'
}]]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-pro/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>