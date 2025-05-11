/**
 * This is the example controller 
 */
import { FastifyReply, FastifyRequest } from "fastify";

export const helloWorldController = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        reply.send({ message: 'Fastify Server Is Running Successfully!' });
    } catch (error) {
        console.log(`Error in ${helloWorldController.name}`, error);
        reply.code(500)
        reply.send({ error });
    }
}