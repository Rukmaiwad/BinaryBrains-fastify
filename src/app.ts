/**
 * File contains the router and plugins registration code.
 */

import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMongodb from '@fastify/mongodb';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import dotenv from 'dotenv';
import helloWorldRouter from './routes/helloWorldRouter';
import authRouter from './routes/authRouter';
import mongoosePlugin from './plugins/mongoose';
import { initLogger } from './utils/logger';

dotenv.config();
const app = Fastify({ logger: true });

// registering cors to get the requests.
app.register(fastifyCors, {
    origin: true
});

// Register mongoose plugin
app.register(mongoosePlugin);

// mongodb connection
app.register(fastifyMongodb, {
    forceClose: true,
    url: process.env.MONGO_DB_URI
});

// to set the cookies
app.register(fastifyCookie);

// registering jwt
app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET
});

// ALL ROUTES WILL COME HERE
app.register(helloWorldRouter, { prefix : '/api/helloWorld' });
app.register(authRouter, { prefix: '/api/auth' })

// initialize logger here
initLogger(app);

export default app; 