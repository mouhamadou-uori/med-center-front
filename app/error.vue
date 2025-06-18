<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'Page introuvable',
  description: 'Nous sommes désolés mais cette page n\'a pas pu être trouvée.'
})

useHead({
  htmlAttrs: {
    lang: 'fr'
  }
})
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>
