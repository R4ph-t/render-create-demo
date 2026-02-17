export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  modules: [],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    public: {
      appName: "{{PROJECT_NAME}}",
    },
  },
});
