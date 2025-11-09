/**
 * Resource Controller
 * -------------------
 * This file manages CRUD operations for Resources within the RBAC system.
 *
 * Features:
 *  - Create or restore resources
 *  - Soft delete resources
 *  - Fetch resources by ID
 *  - Paginated list search with optional filtering
 *  - Full update (PUT)
 *  - Partial field update (PATCH)
 *  - Validate unique resource name
 *
 * Logging:
 *  - `info` → High-level action flow
 *  - `debug` → Request details & DB results for debugging
 *
 * Error Handling:
 *  - Unified error response format
 *  - Internal server errors are logged and return a safe message
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { isInvalid } from '../utils/util';
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGES } from '../utils/httpUtils';
import {
  createRecords,
  updateRecords,
  getSingleRecord,
  getFilteredRecordsWithPagination,
} from '../utils/sql/sqlUtils';
import { Resource } from '../entities/Resource';


/**
 * Create or restore a resource
 */
export const createResource = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running createResource...");

  try {
    request.server.log.debug(`Request Body: ${JSON.stringify(request.body)}`);

    const { name, description } = request.body as any;
    const normalizedName = name?.trim()?.toLowerCase();
    // @ts-ignore
    const userId = request.user?.id;

    if (isInvalid(normalizedName) || isInvalid(description)) {
      request.server.log.info("Resource name or description missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Resource name or description is missing.",
      });
    }

    request.server.log.info(`Checking if resource '${normalizedName}' already exists...`);
    const existingResource = await getSingleRecord(Resource, {where : { name: normalizedName }});

    let result;

    if (existingResource) {
      request.server.log.info(`Existing resource found. Restoring '${normalizedName}'`);
      result = await updateRecords(Resource, { name: normalizedName }, {
        description,
        isDeleted: 0,
        updatedBy: userId,
        updatedAt: new Date(),
      });
    } else {
      request.server.log.info(`Creating new resource '${normalizedName}'`);
      result = await createRecords(Resource, {
        name: normalizedName,
        description,
        isDeleted: 0,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    request.server.log.debug(`Create/Restore Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.CREATED).send({
      status: HTTP_STATUS_MESSAGES.CREATED,
      message: "Resource created successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in createResource");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error?.message || "Internal Server Error.",
    });
  }
};


/**
 * Soft delete a resource
 */
export const deleteResource = async (
  request: FastifyRequest<{ Params: { resourceId: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running deleteResource...");

  try {
    request.server.log.debug(`Request Params: ${JSON.stringify(request.params)}`);

    const { resourceId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    if (isInvalid(resourceId)) {
      request.server.log.info("Resource ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Resource ID is required for deletion.",
      });
    }

    request.server.log.info(`Soft deleting resource with id: ${resourceId}`);
    const result = await updateRecords(Resource, { id: resourceId }, {
      isDeleted: 1,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    request.server.log.debug(`Soft Delete Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Resource deleted successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in deleteResource");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error?.message || "Internal Server Error.",
    });
  }
};


/**
 *  Get resource by ID
 */
export const getResourceById = async (
  request: FastifyRequest<{ Params: { resourceId: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running getResourceById...");

  try {
    const { resourceId } = request.params;
    request.server.log.debug(`ResourceId: ${resourceId}`);

    if (isInvalid(resourceId)) {
      request.server.log.info("Resource ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Resource ID is missing.",
      });
    }

    const resource = await getSingleRecord(Resource,{ where: { id: resourceId, isDeleted: 0 }});

    if (isInvalid(resource)) {
      request.server.log.info(`No active resource found for ID: ${resourceId}`);
      return reply.status(HTTP_STATUS_CODE.NOT_FOUND).send({
        status: HTTP_STATUS_MESSAGES.NOT_FOUND,
        message: "Resource not found.",
      });
    }

    request.server.log.debug(`Resource Data: ${JSON.stringify(resource)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Resource fetched successfully.",
      data: resource,
    });

  } catch (error: any) {
    request.server.log.info("Error in getResourceById");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error?.message || "Internal Server Error.",
    });
  }
};


/**
 * Get paginated resources
 */
export const getResources = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running getResources...");

  try {
    request.server.log.debug(`Query Params: ${JSON.stringify(request.query)}`);

    const { page = '1', limit = '10', title = '' } = request.query as any;

    const query: any = { isDeleted: 0 };
    if (title?.trim()) {
      request.server.log.info(`Applying name filter: '${title}'`);
      query.name = { $regex: title.trim(), $options: 'i' };
    }

    const result = await getFilteredRecordsWithPagination(
      Resource,
      { page: Number(page), limit: Number(limit), },
      query,
    );

    request.server.log.debug(`Pagination Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Resources fetched successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in getResources");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error?.message || "Internal Server Error.",
    });
  }
};


/**
 * Update full resource (PUT)
 */
export const updateResource = async (
  request: FastifyRequest<{ Params: { resourceId: string }; Body: { name?: string; description?: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running updateResource...");

  try {
    const { resourceId } = request.params;
    const { name, description } = request.body;
    // @ts-ignore
    const userId = request.user?.id;

    request.server.log.debug(`Updating Resource: ${resourceId}`);

    if (isInvalid(resourceId)) {
      request.server.log.info("Resource ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Resource ID is required.",
      });
    }

    const updateData: any = { updatedBy: userId, updatedAt: new Date() };
    if (name) updateData.name = name.trim().toLowerCase();
    if (description) updateData.description = description;

    const result = await updateRecords(Resource, { id: resourceId, isDeleted: 0 }, updateData);

    request.server.log.debug(`Update Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Resource updated successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in updateResource");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error?.message || "Internal Server Error.",
    });
  }
};


/**
 * Partially update resource (PATCH)
 */
export const updateResourceFields = async (
  request: FastifyRequest<{ Params: { resourceId: string }; Body: { name?: string; description?: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running updateResourceFields...");

  try {
    const { resourceId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    request.server.log.debug(`ResourceId: ${resourceId} | Body: ${JSON.stringify(request.body)}`);

    if (isInvalid(resourceId)) {
      request.server.log.info("Resource ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Resource ID is missing.",
      });
    }

    const updateObj: any = { updatedBy: userId, updatedAt: new Date() };
    if (request.body.name !== undefined) updateObj.name = request.body.name.trim().toLowerCase();
    if (request.body.description !== undefined) updateObj.description = request.body.description;

    const result = await updateRecords(Resource, { id: resourceId }, updateObj);

    request.server.log.debug(`Partial Update Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Resource fields updated successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in updateResourceFields");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error?.message || "Internal Server Error.",
    });
  }
};


/**
 * Validate resource name uniqueness
 */
export const validateResourceTitle = async (
  request: FastifyRequest<{ Querystring: { name?: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running validateResourceTitle...");

  try {
    const name = request.query?.name?.trim()?.toLowerCase();

    request.server.log.debug(`Validating Resource Name: ${name}`);

    if (isInvalid(name)) {
      request.server.log.info("Resource name missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: false,
        message: "Resource name is missing.",
      });
    }

    const existing = await getSingleRecord(Resource, {where: { name, isDeleted: 0 }});

    request.server.log.info("Resource title validation complete.");

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: !!existing,
      message: "success",
    });

  } catch (error: any) {
    request.server.log.info("Error in validateResourceTitle");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error?.message || "Internal Server Error.",
    });
  }
};
