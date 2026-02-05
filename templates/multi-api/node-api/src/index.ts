import Fastify from "fastify";
import cors from "@fastify/cors";
import { db } from "./db";
import { users } from "./db/schema";

const fastify = Fastify({
  logger: true,
});

// Register plugins
fastify.register(cors, {
  origin: true,
});

// Health check endpoint
fastify.get("/health", async () => {
  return { status: "ok", service: "node-api" };
});

// Example: Get all users
fastify.get("/users", async () => {
  const allUsers = await db.select().from(users);
  return allUsers;
});

// API info
fastify.get("/", async () => {
  return {
    service: "{{PROJECT_NAME}} Node API",
    runtime: "Node.js + Fastify",
    orm: "Drizzle",
    endpoints: ["/", "/health", "/users"],
  };
});

// Start server
const start = async () => {
  try {
    const host = process.env.HOST ?? "0.0.0.0";
    const port = Number(process.env.PORT) || 3001;

    await fastify.listen({ host, port });
    console.log(`Node API running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
