import Config

config :{{PROJECT_NAME}}, {{PROJECT_NAME}}Web.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

config :logger, level: :info
