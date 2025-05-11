import Fastify from 'fastify';
import helloWorldRouter from './routes/helloWorldRouter';

const app = Fastify({ logger: true });

// ALL ROUTES WILL COME HERE
app.register(helloWorldRouter, { prefix : '/api/helloWorld' });

export default app; 