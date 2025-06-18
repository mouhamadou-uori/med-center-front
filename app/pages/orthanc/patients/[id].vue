<script setup>
/**
 * Cette page a été remplacée par un modal dans la page /orthanc/patients.vue
 * Toute navigation vers cette page sera redirigée vers la page principale des patients
 */
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/orthanc/patients')
    }
  ]
})
</script>

<template>
  <div class="p-8 text-center">
    <p>Redirection vers la liste des patients...</p>
  </div>
</template>
