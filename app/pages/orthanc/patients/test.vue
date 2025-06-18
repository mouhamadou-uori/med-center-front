<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-green-600">✅ Page de test ULTRA simple</h1>
    <p>Cette page s'affiche = La navigation fonctionne !</p>
    <p>Patient ID: {{ $route.params.id }}</p>
    <p>Timestamp: {{ new Date().toISOString() }}</p>
    <button @click="$router.push('/orthanc/patients')" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
      Retour
    </button>
  </div>
</template>

<script setup>
// AUCUN definePageMeta pour éviter l'auth
console.log('🧪 Page de test ULTRA simple chargée')
console.log('Path:', useRoute().path)
console.log('Params:', useRoute().params)
</script>
