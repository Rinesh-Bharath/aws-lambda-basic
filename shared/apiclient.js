'use strict';
import needle from 'needle';
import _ from 'lodash';

let last_post_time_stamp = new Date();
exports.post_to_API = (logging_key, path, payload = {}) => {
  console.log(logging_key + ' post_to_API - executing');
  const delay_since_last_post = new Date().getTime() - last_post_time_stamp.getTime();
  console.log(logging_key + ' post_to_API - delay since last post: ' + delay_since_last_post + ' ms');
  last_post_time_stamp = new Date();
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    console.log(logging_key + ' = post_to_API posting request');
    console.log(logging_key + ' path = ' + path);
    needle.post(path, payload, options, (error, response) => {
      console.log(logging_key + ' = post_to_API response received statusCode = ' + (response && response.statusCode));
      if (error) {
        console.log(logging_key + ' = post_to_API error');
        console.log(error, error.stack);
        return reject(new Error(`post_to_API = ${error.message}`));
      } else if (`${response.statusCode}`.slice(0, 1) !== '2') {
        console.log(logging_key + ' = post_to_API Failed statusCode = ' + response.statusCode);
        console.log(logging_key + ' = post_to_API Failed object = ' + JSON.stringify(response.body));
        const err = new Error('RemoteRequestFailed:' + response.statusCode + ' ' + _.get(response, 'body.message', '') + ' ' + _.get(response, 'body.details.message', ''));
        return reject(err);
      }
      return resolve(response);
    });
  });
};

exports.get_from_API = (logging_key, path) => {
  console.log(logging_key + ' get_from_API - executing');
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    console.log(logging_key + ' = get_from_API sending request');
    console.log(logging_key + ' path = ' + path);
    needle.get(path, options, (error, response) => {
      console.log(logging_key + ' = get_from_API response received statusCode = ' + (response && response.statusCode));
      if (error) {
        console.log(logging_key + ' = get_from_API error');
        console.log(error, error.stack);
        return reject(new Error(`get_from_API = ${error.message}`));
      } else if (`${response.statusCode}`.slice(0, 1) !== '2') {
        console.log(logging_key + ' = get_from_API Failed statusCode = ' + response.statusCode);
        console.log(logging_key + ' = get_from_API Failed object = ' + JSON.stringify(response.body));
        const err = new Error('RemoteRequestFailed:' + response.statusCode + ' ' + _.get(response, 'body.message', '') + ' ' + _.get(response, 'body.details.message', ''));
        return reject(err);
      }
      return resolve(response);
    });
  });
};
