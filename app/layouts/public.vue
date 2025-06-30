<script setup lang="ts">
const toast = useToast()

onMounted(() => {
  // Cookie consent peut rester le même
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'Nous utilisons des cookies propriétaires pour améliorer votre expérience sur notre site Web.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accepter',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Refuser',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation publique -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/conseils" class="text-blue-600 text-xl font-bold">
                MedCenter
              </NuxtLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <!-- <NuxtLink to="/" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="$route.path === '/' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                Accueil
              </NuxtLink>
              <NuxtLink to="/pathologies" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="$route.path.includes('/pathologies') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                Pathologies
              </NuxtLink> -->
              <NuxtLink to="/conseils" class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" :class="$route.path.includes('/conseils') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
                Conseils
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center text-black">
            <UButton color="blue" to="/login" variant="soft">
              Connexion
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
