<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-green-600">✅ Navigation avec NuxtLink réussie!</h1>
    <p>ID: {{ $route.params.id }}</p>
    <NuxtLink to="/debug-navigation" class="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded">← Retour aux tests</NuxtLink>
  </div>
</template>
