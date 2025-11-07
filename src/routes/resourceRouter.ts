import { FastifyInstance } from 'fastify';
import { createResource, deleteResource, getResourceById, getResources, updateResource, updateResourceFields, validateResourceTitle } from '../controllers/resourceController';

export async function resourceRoutes(fastify: FastifyInstance) {

  // Get all resources
  fastify.get('/', {
    // preHandler: authenticateToken,
    handler: getResources,
  });

  // Check resource title (static route must come before :id route)
  fastify.get('/check/title', {
    // preHandler: authenticateToken,
    handler: validateResourceTitle,
  });

  // Get resource by ID
  fastify.get('/:resourceId', {
    // preHandler: authenticateToken,
    handler: getResourceById,
  });

  // Create resource
  fastify.post('/', {
    // preHandler: authenticateToken,
    handler: createResource,
  });

  // Update resource (full update)
  fastify.put('/:resourceId', {
    // preHandler: authenticateToken,
    handler: updateResource,
  });

  // Update specific fields (partial update)
  fastify.patch('/:resourceId', {
    // preHandler: authenticateToken,
    handler: updateResourceFields,
  });

  // Delete resource
  fastify.delete('/:resourceId', {
    // preHandler: authenticateToken,
    handler: deleteResource,
  });
}
