/**
 * Role Controller
 * ---------------
 * This file contains request handlers for managing Roles within the system.
 *
 * Features:
 *  - Create or restore (reactivate) a role
 *  - Soft delete a role
 *  - Fetch a role by ID
 *  - Get paginated roles with optional search filter
 *  - Fully update role (PUT)
 *  - Partially update role fields (PATCH)
 *  - Validate unique role name
 *
 * Logging:
 *  - `info` logs describe the high-level action flow.
 *  - `debug` logs print supporting request or result details for deeper debugging.
 *
 * Error Handling:
 *  - All responses follow standardized HTTP status codes and messages.
 *  - Internal errors are logged and return a safe response.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { isInvalid } from '../utils/util';
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGES } from '../utils/httpUtils';
import {
  createRecords,
  getSingleRecord,
  getFilteredRecordsWithPagination,
  updateRecords,
} from '../utils/sql/sqlUtils';
import { Role } from '../entities/Role';


/**
 * Create or restore a role
 */
export const createRole = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running createRole...");

  try {
    request.server.log.debug(`Request Body: ${JSON.stringify(request.body)}`);

    const body = request.body as { name?: string; description?: string };
    const name = body?.name?.trim()?.toLowerCase();
    const description = body?.description;
    // @ts-ignore
    const userId = request.user?.id;

    if (isInvalid(name) || isInvalid(description)) {
      request.server.log.info("Role name or description missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Role name or description is missing.",
      });
    }

    request.server.log.info(`Checking if role '${name}' already exists...`);
    const existingRole = await getSingleRecord(Role, { where: { name: name } },);

    let result;

    if (existingRole) {
      request.server.log.info(`Role exists. Restoring role '${name}'.`);
      result = await updateRecords(Role, { name }, {
        description,
        isDeleted: 0,
        updatedBy: userId,
        updatedAt: new Date(),
      });
    } else {
      request.server.log.info(`Creating new role '${name}'.`);
      result = await createRecords(Role, {
        name,
        description,
        createdBy: userId,
        updatedBy: userId,
        isDeleted: 0,
      });
    }

    request.server.log.debug(`Role Create/Restore Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.CREATED).send({
      status: HTTP_STATUS_MESSAGES.CREATED,
      message: "Role created successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in createRole");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Soft delete a role
 */
export const deleteRole = async (
  request: FastifyRequest<{ Params: { roleId: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running deleteRole...");

  try {
    request.server.log.debug(`Request Params: ${JSON.stringify(request.params)}`);

    const { roleId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    if (isInvalid(roleId)) {
      request.server.log.info("Role ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Role ID is required for deletion.",
      });
    }

    request.server.log.info(`Soft deleting role with id: ${roleId}`);
    const result = await updateRecords(Role, { id: roleId }, {
      isDeleted: 1,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    request.server.log.debug(`Soft Delete Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Role deleted successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in deleteRole");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Get role by ID
 */
export const getRoleById = async (
  request: FastifyRequest<{ Params: { roleId: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running getRoleById...");

  try {
    const { roleId } = request.params;
    request.server.log.debug(`RoleId: ${roleId}`);

    if (isInvalid(roleId)) {
      request.server.log.info("Role ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Role ID is missing.",
      });
    }

    const role = await getSingleRecord(Role,{ where: { id: roleId, isDeleted: 0 }});

    if (isInvalid(role)) {
      request.server.log.info(`No active role found for ID: ${roleId}`);
      return reply.status(HTTP_STATUS_CODE.NOT_FOUND).send({
        status: HTTP_STATUS_MESSAGES.NOT_FOUND,
        message: "Role not found.",
      });
    }

    request.server.log.debug(`Fetched Role Data: ${JSON.stringify(role)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Role fetched successfully.",
      data: role,
    });

  } catch (error: any) {
    request.server.log.info("Error in getRoleById");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 *  Get paginated roles with search
 */
export const getRoles = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running getRoles...");

  try {
    request.server.log.debug(`Query Params: ${JSON.stringify(request.query)}`);

    const { page = '1', limit = '10', title = '' } = request.query as any;

    const query: any = { isDeleted: 0 };
    if (title?.trim()) {
      request.server.log.info(`Applying role name filter: ${title}`);
      query.name = { $regex: title.trim(), $options: 'i' };
    }

    const result = await getFilteredRecordsWithPagination(
      Role,
      { page: Number(page), limit: Number(limit) },
      query,
    );

    request.server.log.debug(`Pagination Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Roles fetched successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in getRoles");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Update full role (PUT)
 */
export const updateRole = async (
  request: FastifyRequest<{ Params: { roleId: string }; Body: { name?: string; description?: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running updateRole...");

  try {
    const { roleId } = request.params;
    const { name, description } = request.body;
    // @ts-ignore
    const userId = request.user?.id;

    request.server.log.debug(`Updating Role ID: ${roleId}`);

    if (isInvalid(roleId)) {
      request.server.log.info("Role ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Role ID is required.",
      });
    }

    const updateData: any = { updatedBy: userId, updatedAt: new Date() };
    if (name) updateData.name = name.trim().toLowerCase();
    if (description) updateData.description = description;

    request.server.log.info(`Updating role ${roleId}`);
    const result = await updateRecords(Role, { id: roleId, isDeleted: 0 }, updateData);

    request.server.log.debug(`Update Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Role updated successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in updateRole");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Partially update role (PATCH)
 */
export const updateRoleFields = async (
  request: FastifyRequest<{ Params: { roleId: string }; Body: { name?: string; description?: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running updateRoleFields...");

  try {
    const { roleId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    request.server.log.debug(`RoleId: ${roleId} | Body: ${JSON.stringify(request.body)}`);

    if (isInvalid(roleId)) {
      request.server.log.info("Role ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Role ID is missing.",
      });
    }

    const updateObj: any = { updatedBy: userId, updatedAt: new Date() };
    if (request.body.name !== undefined) updateObj.name = request.body.name.trim().toLowerCase();
    if (request.body.description !== undefined) updateObj.description = request.body.description;

    request.server.log.info(`Partially updating role ${roleId}`);
    const result = await updateRecords(Role, { id: roleId }, updateObj);

    request.server.log.debug(`Partial Update Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Role fields updated successfully.",
      data: result,
    });

  } catch (error: any) {
    request.server.log.info("Error in updateRoleFields");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Validate role name uniqueness
 */
export const validateRoleTitle = async (
  request: FastifyRequest<{ Querystring: { name?: string } }>,
  reply: FastifyReply
) => {
  request.server.log.info("Running validateRoleTitle...");

  try {
    const name = request.query?.name?.trim()?.toLowerCase();

    request.server.log.debug(`Validating Role Title: ${name}`);

    if (isInvalid(name)) {
      request.server.log.info("Role name missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: false,
        message: "Role name is missing.",
      });
    }

    const existing = await getSingleRecord(Role, {where: { name, isDeleted: 0 }});

    request.server.log.info("Validation completed.");

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: !!existing,
      message: "success",
    });

  } catch (error: any) {
    request.server.log.info("Error in validateRoleTitle");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};
