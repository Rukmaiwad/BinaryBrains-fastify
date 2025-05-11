/**
 * This is the example route
 */
import { FastifyInstance } from "fastify";
import { helloWorldController } from "../controllers/helloWorldController";

const helloWorldRouter = (fastify: FastifyInstance) => {
    fastify.get('/', helloWorldController);
}

export default helloWorldRouter;