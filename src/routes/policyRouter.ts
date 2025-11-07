/**
 * Policy Routes (Fastify + TypeScript)
 * ------------------------------------
 * Handles CRUD and ACL (Access Control List) operations for policies.
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { createPolicy, deletePolicy, getPolicies, getPolicyById, updateAccessControlList, updatePolicy } from '../controllers/policyController';

export const policyRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {

  // Apply authentication globally for all routes in this plugin
//   fastify.addHook('preHandler', authenticateToken);

  fastify.get('/', {
    handler: getPolicies,
  });

  fastify.get('/:policyId', {
    handler: getPolicyById,
  });

  fastify.post('/', {
    handler: createPolicy,
  });

  fastify.put('/:policyId', {
    handler: updatePolicy,
  });

  // fastify.patch('/:policyId', {
  //   handler: updatePolicyFields,
  // });

  fastify.delete('/:policyId', {
    handler: deletePolicy,
  });

  fastify.post('/list', {
    handler: updateAccessControlList,
  });
};
