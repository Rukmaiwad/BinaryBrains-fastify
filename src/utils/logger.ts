import { FastifyInstance } from "fastify";

let logger: FastifyInstance['log'] | null = null;

// Initialization function for logger
export function initLogger(fastify: FastifyInstance) {
  logger = fastify.log;
}

// Getter to safely access logger anywhere
export function getLogger() {
  if (!logger) {
    throw new Error("Logger not initialized! Call initCacheUtils(fastify) first.");
  }
  return logger;
}