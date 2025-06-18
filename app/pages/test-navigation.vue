<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Test de Navigation</h1>
    
    <div class="space-y-4">
      <button 
        @click="testNavigation1"
        class="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test navigateTo
      </button>
      
      <button 
        @click="testNavigation2"
        class="bg-green-500 text-white px-4 py-2 rounded"
      >
        Test router.push
      </button>
      
      <button 
        @click="testNavigation3"
        class="bg-purple-500 text-white px-4 py-2 rounded"
      >
        Test window.location
      </button>
    </div>
    
    <div class="mt-6">
      <h2 class="text-lg font-semibold">Debug Info:</h2>
      <pre class="bg-gray-100 p-4 rounded mt-2">{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const debugInfo = ref({
  currentRoute: route.path,
  timestamp: new Date().toISOString()
})

const testNavigation1 = async () => {
  console.log('🧪 Test navigateTo')
  try {
    await navigateTo('/orthanc/patients/test-patient-123')
    console.log('✅ navigateTo réussi')
  } catch (error) {
    console.error('❌ navigateTo échoué:', error)
  }
}

const testNavigation2 = () => {
  console.log('🧪 Test router.push')
  try {
    router.push('/orthanc/patients/test-patient-123')
    console.log('✅ router.push réussi')
  } catch (error) {
    console.error('❌ router.push échoué:', error)
  }
}

const testNavigation3 = () => {
  console.log('🧪 Test window.location')
  try {
    window.location.href = '/orthanc/patients/test-patient-123'
    console.log('✅ window.location réussi')
  } catch (error) {
    console.error('❌ window.location échoué:', error)
  }
}
</script>
