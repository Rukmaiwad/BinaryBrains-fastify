/**
 * File contains the utility functions helps to perform the operations on mongodb
 */

import fastify, { FastifyInstance } from "fastify";

// utility function to find all data from the mongodb
export const findAllDataWithFilter = async (fastify: FastifyInstance, collection: string, filter: Record<string, any>) => {
    try {
        fastify.log.info(`Finding all data with filter for collection : ${collection}`);
        const data = await fastify.mongo.db?.collection(collection).find(filter).toArray();
        return data;
    } catch (error) {
        fastify.log.error(`Error in ${findAllDataWithFilter.name}: ${error.message}`);
        return null;
    }
}

// to find the single data
export const findOne = async (fastify: FastifyInstance, collection: string, filter: Record<string, any>) => {
    try {
        fastify.log.info(`Finding one data with filter for collection: ${collection} with filter: ${filter}`);
        const data = await fastify.mongo.db?.collection(collection).findOne(filter);
        return data;
    } catch (error) {
        fastify.log.error(`Error in findOne : ${ error.message}`);
    }
}

export const createRecord = async (fastify: FastifyInstance, collection: string, data: Record<string, any>) => {
    try {
        fastify.log.info(`Creating record in collection: ${collection}`);
        const result = await fastify.mongo.db.collection(collection).insertOne(data);
        return result;
    } catch (error) {
        fastify.log.error(`Error in createRecord ${error.message}`);
        return null;
    }
}

export const findOneAndUpdate = async (

    fastify: FastifyInstance,
    collection: string,
    filter: Record<string, any>,
    updateObject: Record<string, any>

  ) => {
    try {
      fastify.log.info(`Finding and updating record in collection: ${collection}`);
      
      const result = await fastify.mongo.db
        .collection(collection)
        .findOneAndUpdate(
          filter,
          { $set: updateObject }, 
          { returnDocument: 'after' }
        );
      
      return result.value ?? true; // return updated doc or true

    } catch (error) {
      fastify.log.error(`Error in findOneAndUpdate: ${error.message}`);
      return false;
    }
};
  