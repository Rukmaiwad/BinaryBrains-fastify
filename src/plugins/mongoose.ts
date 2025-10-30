/**
 * File contains the plugin for the connection of mongodb
 */

import fp from 'fastify-plugin';
import mongoose from 'mongoose';

async function mongoosePlugin(fastify: any) {
  try {

    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    fastify.decorate('mongoose', { conn });
    fastify.log.info(`✅ MongoDB Connected`);

    fastify.addHook('onClose', async () => {
      await mongoose.connection.close();
    });

  } catch (err) {
    fastify.log.error(`MongoDB Connection Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

export default fp(mongoosePlugin);