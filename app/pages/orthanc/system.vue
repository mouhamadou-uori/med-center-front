<script setup lang="ts">
definePageMeta({
  requiresAuth: true
})
// Redirect to statistics page which already contains system information
const router = useRouter()
router.push('/orthanc/statistics')
</script>

<template>
  <UContainer>
    <div class="flex justify-center items-center h-32">
      <p>Redirecting to statistics page...</p>
    </div>
  </UContainer>
</template>
