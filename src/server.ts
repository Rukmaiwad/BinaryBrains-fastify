import app from "./app";

const PORT = parseInt(process.env.PORT) || 3002;

// TO START THE SERVER
const startServer = async () => {
    try {
        await app.listen({ port: PORT });
        app.log.info(`Fastify Server Of Binary Brains Running On PORT : ${PORT}`);
    } catch (error) {
        app.log.error("Error While Initializing Fastify Server");
        process.exit(1);
    }
};

startServer()