import Fastify from "fastify";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
});

// Health check endpoint
fastify.get("/health", async () => {
  return { status: "ok", service: "node-api" };
});

// Example API endpoint
fastify.get("/api/hello", async () => {
  return { message: "Hello from Node.js (Fastify)!", timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const host = process.env.HOST || "0.0.0.0";
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host });
    console.log(`Node API listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
