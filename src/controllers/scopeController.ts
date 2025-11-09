import { FastifyRequest, FastifyReply } from 'fastify';
import { isInvalid } from '../utils/util';
import { HTTP_STATUS_CODE, HTTP_STATUS_MESSAGES } from '../utils/httpUtils';
import { createRecords, getFilteredRecordsWithPagination, getSingleRecord, updateRecords } from '../utils/sql/sqlUtils';
import { Scope } from '../entities/Scope';

/**
 * Scope Controller
 * ----------------
 * This file contains request handlers for managing Scopes within the system.
 *
 * Features:
 *  - Create or restore a previously deleted scope
 *  - Soft delete scopes
 *  - Fetch scopes with pagination and optional search filter
 *  - Get a scope by its ID
 *  - Fully update scope fields (PUT)
 *  - Partially update scope fields (PATCH)
 *  - Validate unique scope name
 *
 * Logging:
 *  - Only `info` and `debug` logs are used to ensure clean, meaningful tracing.
 *  - `info` logs describe the action taking place.
 *  - `debug` logs provide supporting data for deeper insight when needed.
 *
 * Error Handling:
 *  - All handlers return structured HTTP responses with consistent status messages.
 *  - Server-side errors are logged and return generic safe error messages.
 *
 * Author:
 *  - Updated based on your logging standard example (`deleteProblemById`).
 */


/**
 * Create or restore a scope
 */
export const createScope = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running createScope...");

  try {
    request.server.log.debug(`Received Body: ${JSON.stringify(request.body)}`);

    const { name, description } = request.body as { name?: string; description?: string };
    // @ts-ignore
    const userId = request.user?.userId;

    const normalizedName = name?.trim()?.toLowerCase();

    if (isInvalid(normalizedName) || isInvalid(description)) {
      request.server.log.info("Scope name or description missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Scope name or description is missing."
      });
    }

    request.server.log.info(`Checking if scope '${normalizedName}' already exists...`);
    const existingScope = await getSingleRecord(Scope, { where: { name: normalizedName } });

    let result;

    if (existingScope) {
      request.server.log.info(`Existing scope found. Restoring and updating scope '${normalizedName}'.`);
      result = await updateRecords(Scope, { name: normalizedName }, {
        description,
        isDeleted: 0,
        updatedBy: userId,
        updatedAt: new Date()
      });
    } else {
      request.server.log.info(`Creating new scope '${normalizedName}'.`);
      result = await createRecords(Scope, {
        name: normalizedName,
        description,
        createdBy: userId,
        updatedBy: userId,
        isDeleted: 0
      });
    }

    request.server.log.debug(`Scope Create/Restore Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.CREATED).send({
      status: HTTP_STATUS_MESSAGES.CREATED,
      message: "Scope created successfully.",
      data: result
    });

  } catch (error: any) {
    request.server.log.info("Error in createScope");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Soft delete a scope
 */
export const deleteScope = async (request: FastifyRequest<{ Params: { scopeId: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running deleteScope...");

  try {
    request.server.log.debug(`Params: ${JSON.stringify(request.params)}`);
    const { scopeId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    if (isInvalid(scopeId)) {
      request.server.log.info("ScopeId missing in request.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Scope ID is missing."
      });
    }

    request.server.log.info(`Soft deleting scope with id: ${scopeId}`);
    const result = await updateRecords(Scope, { id: scopeId }, { isDeleted: 1, updatedBy: userId });

    request.server.log.debug(`Soft Delete Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Scope deleted successfully.",
      data: result
    });

  } catch (error: any) {
    request.server.log.info("Error in deleteScope");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Get paginated list of scopes
 */
export const getScopes = async (request: FastifyRequest, reply: FastifyReply) => {
  request.server.log.info("Running getScopes...");

  try {
    request.server.log.debug(`Query: ${JSON.stringify(request.query)}`);

    const { page = '1', limit = '10', title = '' } = request.query as any;

    const filters: any = { isDeleted: 0 };
    if (title?.trim()) {
      request.server.log.info(`Applying title filter: ${title}`);
      filters.name = { $regex: title.trim(), $options: 'i' };
    }

    const result = await getFilteredRecordsWithPagination(Scope, { page: Number(page), limit: Number(limit) }, filters);

    request.server.log.debug(`Paginated Result: ${JSON.stringify(result)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Scopes fetched successfully.",
      data: result
    });

  } catch (error: any) {
    request.server.log.info("Error in getScopes");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * Get scope by ID
 */
export const getScopeById = async (request: FastifyRequest<{ Params: { scopeId: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running getScopeById...");

  try {
    const { scopeId } = request.params;
    request.server.log.debug(`ScopeId: ${scopeId}`);

    if (isInvalid(scopeId)) {
      request.server.log.info("Scope ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Scope ID is missing."
      });
    }

    const scope = await getSingleRecord(Scope, { where: { id: scopeId } });

    if (isInvalid(scope)) {
      request.server.log.info("Scope not found.");
      return reply.status(HTTP_STATUS_CODE.NOT_FOUND).send({
        status: HTTP_STATUS_MESSAGES.NOT_FOUND,
        message: "Scope not found."
      });
    }

    request.server.log.debug(`Scope Data: ${JSON.stringify(scope)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Scope fetched successfully.",
      data: scope
    });

  } catch (error: any) {
    request.server.log.info("Error in getScopeById");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Error occurred, contact admin."
    });
  }
};


/**
 * Update complete scope (PUT)
 */
export const updateScope = async (request: FastifyRequest<{ Params: { scopeId: string }; Body: { name: string; description: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running updateScope...");

  try {
    const { scopeId } = request.params;
    const { name, description } = request.body;
    // @ts-ignore
    const userId = request.user?.userId;

    request.server.log.debug(`Updating Scope ID: ${scopeId}`);

    if (isInvalid(scopeId)) {
      request.server.log.info("Scope ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Scope ID is required."
      });
    }

    const updateData: any = { updatedBy: userId };
    if (name) updateData.name = name.trim().toLowerCase();
    if (description) updateData.description = description;

    request.server.log.info(`Updating scope with id: ${scopeId}`);
    const updated = await updateRecords(Scope, { id: scopeId }, updateData);

    request.server.log.debug(`Updated Data: ${JSON.stringify(updated)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Scope updated successfully.",
      data: updated
    });

  } catch (error: any) {
    request.server.log.info("Error in updateScope");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * 🧩 Partially update scope (PATCH)
 */
export const updateScopeFields = async (request: FastifyRequest<{ Params: { scopeId: string }; Body: { name?: string; description?: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running updateScopeFields...");

  try {
    const { scopeId } = request.params;
    // @ts-ignore
    const userId = request.user?.id;

    request.server.log.debug(`ScopeId: ${scopeId} | Body: ${JSON.stringify(request.body)}`);

    if (isInvalid(scopeId)) {
      request.server.log.info("Scope ID missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: HTTP_STATUS_MESSAGES.BAD_REQUEST,
        message: "Scope ID is missing."
      });
    }

    const updateObj: any = { updatedBy: userId };
    if (request.body.name !== undefined) updateObj.name = request.body.name.trim().toLowerCase();
    if (request.body.description !== undefined) updateObj.description = request.body.description;

    request.server.log.info(`Partially updating scope ${scopeId}`);
    const updated = await updateRecords(Scope, { id: scopeId }, updateObj);

    request.server.log.debug(`Partial Update Result: ${JSON.stringify(updated)}`);

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: HTTP_STATUS_MESSAGES.SUCCESS,
      message: "Scope fields updated successfully.",
      data: updated
    });

  } catch (error: any) {
    request.server.log.info("Error in updateScopeFields");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};


/**
 * 🔎 Validate uniqueness of scope name
 */
export const validateScopeTitle = async (request: FastifyRequest<{ Querystring: { name?: string } }>, reply: FastifyReply) => {
  request.server.log.info("Running validateScopeTitle...");

  try {
    const name = request.query?.name?.trim();

    request.server.log.debug(`Validating scope title: ${name}`);

    if (isInvalid(name)) {
      request.server.log.info("Name is missing.");
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: false,
        message: "Scope name is missing."
      });
    }

    const existing = await getSingleRecord(Scope, { name: name.toLowerCase(), isDeleted: 0 });

    request.server.log.info("Validation complete.");

    return reply.status(HTTP_STATUS_CODE.SUCCESS).send({
      status: !!existing,
      message: "Success"
    });

  } catch (error: any) {
    request.server.log.info("Error in validateScopeTitle");
    request.server.log.error(error);
    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occured, please contact admin"
    });
  }
};
