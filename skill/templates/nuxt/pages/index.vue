<script setup lang="ts">
const config = useRuntimeConfig();
</script>

<template>
  <div>
    <h1>{{ config.public.appName }}</h1>
    <p>Welcome to your Nuxt application.</p>
  </div>
</template>
