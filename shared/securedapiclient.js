'use strict';
import needle from 'needle';
import { GraphQLClient } from 'graphql-request';

let last_post_time_stamp = new Date();
exports.post_to_API = (path, payload, logging_key) => {
  console.log(logging_key + ' post_to_API - executing');
  const delay_since_last_post = new Date().getTime() - last_post_time_stamp.getTime();
  console.log(logging_key + ' post_to_API - delay since last post: ' + delay_since_last_post + ' ms');
  last_post_time_stamp = new Date();
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.API_TOKEN
      }
    };
    console.log(logging_key + ' = ' + (process.env.API_ENDPOINT + process.env.API_VERSION + path));
    console.log(logging_key + ' = post_to_API posting request');
    needle.post(process.env.API_ENDPOINT + process.env.API_VERSION + path, payload, options, (error, response) => {
      console.log(logging_key + ' = post_to_API response received');
      if (error) {
        console.log(logging_key + ' = post_to_API error');
        console.log(error, error.stack);
        reject(new Error('post_to_API error'));
      }
      resolve(response);
    });
  });
};

exports.get_from_API = (path, logging_key) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(logging_key + ' = get_from_API sending request');
      const options = {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + process.env.API_TOKEN
        }
      };
      console.log(logging_key + ' = ' + process.env.API_ENDPOINT + process.env.API_VERSION + path);
      needle.get(process.env.API_ENDPOINT + process.env.API_VERSION + path, options, (error, response) => {
        console.log(logging_key + ' = get_from_API response received');
        if (error) {
          console.log(logging_key + ' = get_from_API error');
          console.log(error, error.stack);
          reject(new Error('get_from_API error'));
        }
        resolve(response);
      });
    } catch (error) {
      console.log(logging_key + ' = get_from_API error');
      console.log(error, error.stack);
      reject(new Error('get_from_API error'));
    }
  });
};

exports.post_secured_cms_query = (endpoint, query, variables, logging_key) => {
  return new Promise(async (resolve, reject) => {
    console.log(logging_key + ' post_cms_secured_query is getting posted ');
    console.log(logging_key + ' endpoint = ' + endpoint);
    const secured_client = new GraphQLClient(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + process.env.CMS_API_TOKEN
      }
    });
    try {
      const data = await secured_client.request(query, variables);
      console.log(logging_key + ' post_cms_secured_query response received ');
      resolve(data);
    } catch (error) {
      console.log(logging_key + ' post_cms_secured_query response error ');
      console.log(error, error.stack);
      reject(new Error(`post_cms_secured_query error: ${error.message}`));
    }
  });
};
