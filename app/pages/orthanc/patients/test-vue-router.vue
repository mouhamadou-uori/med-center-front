<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-green-600">✅ Navigation avec Vue Router réussie!</h1>
    <p>ID: {{ $route.params.id }}</p>
    <button @click="$router.push('/debug-navigation')" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">← Retour aux tests</button>
  </div>
</template>
