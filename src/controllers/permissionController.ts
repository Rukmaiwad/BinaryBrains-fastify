/**
 * Permission Controller
 * ---------------------
 * Handles creation, fetching, updating, and soft deletion of permissions.
 *
 * Features:
 *  - Paginated list with optional search filter
 *  - Create or restore existing permission
 *  - Get permission by ID
 *  - Soft delete permission
 *  - Update permission fully (PUT) or partially (PATCH)
 *  - Validate unique permission name
 *
 * Logging:
 *  - `info` → High-level flow state
 *  - `debug` → Data snapshots for deeper debugging
 *
 * Error Handling:
 *  - Standardized HTTP status responses
 *  - Internal errors are logged safely
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import { createRecords, getFilteredRecordsWithPagination, getSingleRecord, updateRecords } from '../utils/sql/sqlUtils';
import { Permission } from '../entities/Permission';
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGES } from '../utils/httpUtils';
import { isInvalid } from '../utils/util';


/**
 * Get paginated permissions with optional search
 */
export const getPermissions = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running getPermissions...");

  try {
    request.server.log.debug(`Query: ${JSON.stringify(request.query)}`);

    const { page = '1', limit = '10', title = '' } = request.query as any;

    const query: any = { isDeleted: false };
    if (title?.trim()) {
      request.server.log.info(`Applying permission name filter: ${title}`);
      query.name = { $regex: title.trim(), $options: 'i' };
    }

    const result = await getFilteredRecordsWithPagination(
      Permission,
      { page: Number(page), limit: Number(limit) },
      query,
    );

    request.server.log.debug(`Paginated permissions result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Permissions fetched successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in getPermissions");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};


/**
 * Create or restore permission
 */
export const createPermission = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running createPermission...");

  try {
    const { name, description } = request.body as any;
    // @ts-ignore
    const userId = request.user?.id;

    const normalizedName = name?.trim()?.toLowerCase();

    if (isInvalid(normalizedName) || isInvalid(description)) {
      request.server.log.info("Permission name or description missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Permission name and description are required.",
      });
    }

    request.server.log.info(`Checking if permission '${normalizedName}' exists...`);
    const existing = await getSingleRecord(Permission, { where: { name: normalizedName } });

    let result;

    if (existing) {
      request.server.log.info(`Permission exists, restoring '${normalizedName}'.`);
      await updateRecords(Permission, { name: normalizedName }, {
        description,
        isDeleted: false,
        updatedBy: userId,
      });
      result = await getSingleRecord(Permission, { where: { name: normalizedName } });
    } else {
      request.server.log.info(`Creating new permission '${normalizedName}'.`);
      result = await createRecords(Permission, {
        name: normalizedName,
        description,
        isDeleted: false,
        createdBy: userId,
        updatedBy: userId,
  
      });
    }

    request.server.log.debug(`Permission created/updated: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.CREATED).send({
      status: HTTP_STATUS_MESSAGES.CREATED,
      message: "Permission created successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in createPermission");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};


/**
 *  Soft delete permission
 */
export const deletePermission = async (request: FastifyRequest<{ Params: { permissionId: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running deletePermission...");

  try {
    const { permissionId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    if (isInvalid(permissionId)) {
      request.server.log.info("Permission ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Permission ID is required.",
      });
    }

    const result = await updateRecords(Permission, { id: permissionId }, {
      isDeleted: true,
      updatedBy: userId,
    });

    request.server.log.debug(`Soft delete result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Permission deleted successfully.",
    });

  } catch (error: any) {
    request.server.log.info("Error in deletePermission");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};


/**
 *  Get Permission by ID
 */
export const getPermissionById = async (request: FastifyRequest<{ Params: { permissionId: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running getPermissionById...");

  try {
    const { permissionId } = request.params;

    if (isInvalid(permissionId)) {
      request.server.log.info("Permission ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Permission ID is required.",
      });
    }

    const permission = await getSingleRecord(Permission, { where: { id: permissionId, isDeleted: false } });

    if (isInvalid(permission)) {
      request.server.log.info("Permission not found.");
      return reply.status(HTTP_STATUS_CODE.NOT_FOUND).send({
        status: HTTP_STATUS_MESSAGES.NOT_FOUND,
        message: "Permission not found.",
      });
    }

    request.server.log.debug(`Permission data: ${JSON.stringify(permission)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Permission fetched successfully.",
      data: permission,
    });

  } catch (error: any) {
    request.server.log.info("Error in getPermissionById");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};


/**
 * Full Update (PUT)
 */
export const updatePermission = async (request: FastifyRequest<{ Params: { permissionId: string }; Body: { name?: string; description?: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running updatePermission...");

  try {
    const { permissionId } = request.params;
    const { name, description } = request.body;
    // @ts-ignore
    const userId = request.user?.id;

    request.server.log.debug(`Updating Permission ID: ${permissionId}`);

    if (isInvalid(permissionId)) {
      request.server.log.info("Permission ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Permission ID is required.",
      });
    }

    const updateObj: any = { updatedBy: userId };
    if (name) updateObj.name = name.trim().toLowerCase();
    if (description) updateObj.description = description;

    const result = await updateRecords(Permission, { id: permissionId, isDeleted: false }, updateObj);

    request.server.log.debug(`Update result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Permission updated successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in updatePermission");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};


/**
 *  Partial Update (PATCH)
 */
export const updatePermissionFields = async (request: FastifyRequest<{ Params: { permissionId: string }; Body: { name?: string; description?: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running updatePermissionFields...");

  try {
    const { permissionId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    request.server.log.debug(`Patch update for: ${permissionId}`);

    if (isInvalid(permissionId)) {
      request.server.log.info("Permission ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Permission ID is required.",
      });
    }

    const updateObj: any = { updatedBy: userId };
    if (request.body.name !== undefined) updateObj.name = request.body.name.toLowerCase();
    if (request.body.description !== undefined) updateObj.description = request.body.description;

    const result = await updateRecords(Permission, { id: permissionId }, updateObj);

    request.server.log.debug(`Partial update result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Permission fields updated successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in updatePermissionFields");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};


/**
 * Validate Permission Name Uniqueness
 */
export const validatePermissionTitle = async (request: FastifyRequest<{ Querystring: { name?: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running validatePermissionTitle...");

  try {
    const name = request.query?.name?.trim()?.toLowerCase();

    request.server.log.debug(`Validating Permission Name: ${name}`);

    if (isInvalid(name)) {
      request.server.log.info("Permission name missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: false,
        message: "Permission name is missing.",
      });
    }

    const existing = await getSingleRecord(Permission, {
      where: { name, isDeleted: false },
    });

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: !!existing,
      message: "success",
    });

  } catch (error: any) {
    request.server.log.info("Error in validatePermissionTitle");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
};
