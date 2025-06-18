<script setup lang="ts">
interface Props {
  period: 'daily' | 'weekly' | 'monthly'
  range: {
    start: Date
    end: Date
  }
}

const props = defineProps<Props>()
</script>

<template>
  <div>
    <!-- Ce composant utilise le pattern .client/.server de Nuxt -->
    <!-- Le contenu sera automatiquement fourni par HomeChart.client.vue ou HomeChart.server.vue -->
  </div>
</template>
