import { FastifyInstance } from 'fastify';
import { createRole, deleteRole, getRoleById, getRoles, updateRole, updateRoleFields, validateRoleTitle } from '../controllers/roleController';


export async function roleRoutes(fastify: FastifyInstance) {
  // ✅ Apply authentication globally for all role routes
//   fastify.addHook('preHandler', authenticateToken);

  // Get all roles
  fastify.get('/', {
    handler: getRoles,
  });

  // Validate role title (static route before dynamic one)
  fastify.get('/check/title', {
    handler: validateRoleTitle,
  });

  //  Get role by ID
  fastify.get('/:roleId', {
    handler: getRoleById,
  });

  //  Create role
  fastify.post('/', {
    handler: createRole,
  });

  //  Update role (full)
  fastify.put('/:roleId', {
    handler: updateRole,
  });

  //  Update partial role fields
  fastify.patch('/:roleId', {
    handler: updateRoleFields,
  });

  // Delete role
  fastify.delete('/:roleId', {
    handler: deleteRole,
  });
}
