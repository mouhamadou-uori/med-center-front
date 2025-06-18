<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Test de Navigation</h1>
    
    <div class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold mb-2">Méthode 1: Lien HTML standard</h2>
        <a href="/orthanc/patients/test-html" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          → Test avec lien HTML
        </a>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-2">Méthode 2: NuxtLink</h2>
        <NuxtLink to="/orthanc/patients/test-nuxtlink" class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          → Test avec NuxtLink
        </NuxtLink>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-2">Méthode 3: Vue Router</h2>
        <button @click="testVueRouter" class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          → Test avec Vue Router
        </button>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-2">Méthode 4: navigateTo</h2>
        <button @click="testNavigateTo" class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          → Test avec navigateTo
        </button>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-2">Méthode 5: window.location</h2>
        <button @click="testWindowLocation" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          → Test avec window.location
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()

const testVueRouter = () => {
  console.log('🧪 Test Vue Router')
  router.push('/orthanc/patients/test-vue-router')
}

const testNavigateTo = async () => {
  console.log('🧪 Test navigateTo')
  await navigateTo('/orthanc/patients/test-navigate-to')
}

const testWindowLocation = () => {
  console.log('🧪 Test window.location')
  window.location.href = '/orthanc/patients/test-window-location'
}
</script>
