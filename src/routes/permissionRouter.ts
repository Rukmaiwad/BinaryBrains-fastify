
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createPermission, deletePermission, getPermissionById, getPermissions, updatePermission, updatePermissionFields, validatePermissionTitle } from '../controllers/permissionController';

/**
 * Fastify plugin for permission-related routes.
 */
export const permissionRoutes = (fastify: FastifyInstance) => {

  fastify.get('/', {
    handler: getPermissions,
  });

  fastify.get('/:permissionId', {
    handler: getPermissionById,
  });

  fastify.post('/', {
    handler: createPermission,
  });

  fastify.put('/:permissionId', {
    handler: updatePermission,
  });

  fastify.patch('/:permissionId', {
    handler: updatePermissionFields,
  });

  fastify.delete('/:permissionId', {
    handler: deletePermission,
  });

  fastify.get('/check/title', {
    handler: validatePermissionTitle,
  });
};
