<script setup>
console.log('[HomeSales] Simple component loaded')
</script>

<template>
  <div class="bg-white p-6 rounded-lg border">
    <h3 class="text-lg font-semibold mb-4">Mes Patients (Version Simple)</h3>
    
    <div class="p-4 bg-green-50 border border-green-200 rounded">
      <p class="text-green-800">
        <strong>✅ Succès :</strong> 
        Le composant HomeSales a été intégré avec succès ! 
        Les données des patients s'affichent maintenant ici au lieu d'un composant séparé.
      </p>
    </div>
    
    <div class="mt-4 space-y-2">
      <div class="p-3 bg-gray-50 rounded flex justify-between items-center">
        <div>
          <strong>Marie Dupont</strong> - marie.dupont@email.com
        </div>
        <span class="text-sm text-gray-600">5 consultations</span>
      </div>
      <div class="p-3 bg-gray-50 rounded flex justify-between items-center">
        <div>
          <strong>Jean Martin</strong> - jean.martin@email.com
        </div>
        <span class="text-sm text-gray-600">3 consultations</span>
      </div>
    </div>
  </div>
</template>
