<template>
  <div class="error-container">
    <h1>{{ error.statusCode }}</h1>
    <div class="error-message">{{ error.statusMessage || "Une erreur s'est produite" }}</div>
    <button @click="handleError">Retour aux conseils</button>
  </div>
</template>

<script setup>
defineProps({
  error: Object
})

const handleError = () => {
  // Utiliser l'URL de redirection si elle existe, sinon rediriger vers /conseils
  const redirectPath = error.value?.data?.redirectTo || '/conseils'
  clearError({ redirect: redirectPath })
}
</script>

<style scoped>
.error-container {
  text-align: center;
  padding: 2rem;
  margin: 0 auto;
  max-width: 32rem;
}

h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-message {
  margin-bottom: 2rem;
}

button {
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background-color: #4338ca;
}
</style>
