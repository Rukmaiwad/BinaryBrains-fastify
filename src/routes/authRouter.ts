/**
 * File contains the routes related to authentication and authorization
 */

import { FastifyInstance } from "fastify";
import { googleAuthLogin, loginWithEmailAndPassword, logoutUser, signUpWithEmailAndPassword } from "../controllers/authController";

const authRouter = (fastify: FastifyInstance) => {
    fastify.post('/login', {
        schema: {
            body: {
                type: "object",
                required: ['email', 'password'],
                properties: {
                    email: { type : 'string', format: 'email' },
                    password: { type: 'string' }
                }
            }
        }
    }, loginWithEmailAndPassword);

    fastify.post('/signup', { schema: {
        body: {
            type: 'object',
            required: ['firstName', 'lastName', 'email', 'role', 'password', 'userName'],
            properties: {
                firstName: { type: 'string', minLength: 3 },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string' },
                password: { type: 'string', minLength: 6 },
                userName: { type: 'string', minLength: 6 }
            }
        }
    }}, signUpWithEmailAndPassword),

    fastify.post('/google', { schema: {
        body: {
            type: 'object',
            required: ['token'],
            properties: {
                token: { type: 'string' }
            }
        }
    }}, googleAuthLogin)

    fastify.post('/logout', logoutUser);

}

export default authRouter;