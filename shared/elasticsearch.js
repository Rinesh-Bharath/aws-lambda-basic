import { notify } from './notify';
const elasticsearch = require('elasticsearch');
let elasticsearch_client;

const get_elasticsearch_resource = (logging_key) => {
  console.log(`${logging_key} - get_elasticsearch_resource - started - ${process.env.ELASTICSEARCH_DOMAIN}`);
  if (!elasticsearch_client) {
    elasticsearch_client = new elasticsearch.Client({
      hosts: [process.env.ELASTICSEARCH_DOMAIN]
    });
  }
  console.log(`${logging_key} - get_elasticsearch_resource - finished`);
  return elasticsearch_client;
};

exports.search = async (logging_key, search_params, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!elasticsearch_client) {
        elasticsearch_client = await get_elasticsearch_resource(logging_key);
      }
      elasticsearch_client.search(search_params, (error, response, status) => {
        if (error) {
          console.log(error, error.stack);
          reject(error);
        }
        console.log(logging_key + ' = search - finished ');
        console.log(`${logging_key} = search - took ${response.took} returned ${response.hits.total} hits`);
        console.log(`${logging_key} = search - total records ${response.hits.hits.length}`);
        resolve(response);
      });
    } catch (error) {
      console.log(error, error.stack);
      const notification_message = {
        environment: process.env.ENVIRONMENT,
        step: logging_key,
        message: `${logging_key} - search error`
      };
      await notify('search error', notification_message, logging_key);
      reject(error);
    }
  });
};

exports.health = async (logging_key, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!elasticsearch_client) {
        elasticsearch_client = await get_elasticsearch_resource(logging_key);
      }
      elasticsearch_client.cluster.health({}, (error, response, status) => {
        if (error) {
          console.log(error, error.stack);
          reject(error);
        }
        console.log(logging_key + ' = health - finished ');
        resolve(response);
      });
    } catch (error) {
      console.log(error, error.stack);
      const notification_message = {
        environment: process.env.ENVIRONMENT,
        step: logging_key,
        message: `${logging_key} - health error`
      };
      await notify('health error', notification_message, logging_key);
      reject(error);
    }
  });
};
