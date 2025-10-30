import app from "./app";
import { connectDB } from "./config/database";

const PORT = parseInt(process.env.PORT) || 3002;

// TO START THE SERVER
const startServer = async () => {
    try {
        await connectDB(app); // connect to sql database
        await app.listen({ port: PORT });
        app.log.info(`Fastify Server Of Binary Brains Running On PORT : ${PORT}`);
    } catch (error) {
        app.log.error(`Error While Initializing Fastify Server: ${error.message}`);
        process.exit(1);
    }
};

startServer()