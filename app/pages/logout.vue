<template>
  <div class="flex items-center justify-center h-screen">
    <UCard>
      <div class="text-center">
        <h1 class="text-xl font-bold mb-4">Déconnexion en cours...</h1>
        <p>Veuillez patienter pendant que nous vous déconnectons.</p>
        <div class="mt-4">
          <UButton to="/login" class="mt-4">
            Retour à la page de connexion
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  layout: 'none'
});

import { useAuth } from '../services/auth';

const auth = useAuth();

// Déconnexion automatique lorsque la page est chargée
onMounted(async () => {
  try {
    await auth.logout();
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
});
</script>
