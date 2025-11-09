import { FastifyInstance } from 'fastify';
import { createScope, deleteScope, getScopeById, getScopes, updateScope, updateScopeFields, validateScopeTitle } from '../controllers/scopeController';

export async function scopeRoutes(fastify: FastifyInstance) {
  
  // Get all scopes
  fastify.get('/', {
    schema: {
    },
    handler: getScopes,
  });

  //  Validate scope title (declared before dynamic route)
  fastify.get('/check/title', {
    schema: {
    },
    handler: validateScopeTitle,
  });

  // Get a scope by ID
  fastify.get('/:scopeId', {
    schema: {
      summary: 'Get scope by ID',
      params: {
        type: 'object',
        properties: {
          scopeId: { type: 'string' },
        },
        required: ['scopeId'],
      },
    },
    handler: getScopeById,
  });

  // Create a new scope
  fastify.post('/', {
    schema: {
      summary: 'Create a new scope',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name','description'],
      },
    },
    handler: createScope,
  });

  // Update an existing scope
  fastify.put('/:scopeId', {
    schema: {
      summary: 'Update a scope by ID',
      params: {
        type: 'object',
        properties: {
          scopeId: { type: 'string' },
        },
        required: ['scopeId'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
    handler: updateScope,
  });

  // Update specific fields of a scope
  fastify.patch('/:scopeId', {
    schema: {
      summary: 'Partially update a scope',
      params: {
        type: 'object',
        properties: {
          scopeId: { type: 'string' },
        },
        required: ['scopeId'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
    handler: updateScopeFields,
  });

  // Delete a scope
  fastify.delete('/:scopeId', {
    schema: {
      summary: 'Delete a scope by ID',
      params: {
        type: 'object',
        properties: {
          scopeId: { type: 'string' },
        },
        required: ['scopeId'],
      },
    },
    handler: deleteScope,
  });
}
