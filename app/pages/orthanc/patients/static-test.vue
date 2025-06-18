<template>
  <div class="p-8">
    <h1 class="text-4xl font-bold text-red-600">🚨 ROUTE STATIQUE</h1>
    <p>Si vous voyez ceci, les routes statiques fonctionnent !</p>
    <p>Timestamp: {{ new Date().toISOString() }}</p>
  </div>
</template>

<script setup>
console.log('🔥 Route statique chargée !')
</script>
