<template>
  <div class="p-8">
    <h1 class="text-4xl font-bold text-purple-600">🔍 DEBUG PAGE</h1>
    <p>Si vous voyez ceci, le routing fonctionne !</p>
    <p>Timestamp: {{ new Date().toISOString() }}</p>
  </div>
</template>

<script setup>
console.log('🔍 Page debug chargée !')
</script>
