import url from 'url';
import AWS from 'aws-sdk';

let endpoint, request, http_client;
const get_search_resource = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('getting AWS resource using IAM');
    AWS.config.update({
      region: process.env.SEARCH_REGION
    });
  } else {
    console.log('getting AWS resource using config');
    AWS.config.loadFromPath('./mock/aws.dev.json');
  }
  endpoint = new AWS.Endpoint(process.env.ELASTICSEARCH_DOMAIN);
  request = new AWS.HttpRequest(endpoint, process.env.SEARCH_REGION);
  request.headers['Content-Type'] = 'application/json; charset=UTF-8';
  request.headers['Host'] = url.parse(process.env.ELASTICSEARCH_DOMAIN).hostname;
  http_client = new AWS.HttpClient();
};

/**
 * Sends a request to Elasticsearch
 *
 * @param {string} http_method - The HTTP method, e.g. 'GET', 'PUT', 'DELETE', etc
 * @param {string} request_path - The HTTP path (relative to the Elasticsearch domain), e.g. '.kibana'
 * @param {Object} [payload] - An optional JavaScript object that will be serialized to the HTTP request body
 * @returns {Promise} Promise - object with the result of the HTTP response
 */
function send_request (logging_key, http_method, request_path = '', payload, secure = process.env.SEARCH_SECURED || true) {
  get_search_resource();
  console.log(logging_key + ' send_request - searching ' + process.env.SEARCH_REGION + ' in ES domain ' + process.env.ELASTICSEARCH_DOMAIN + ' with secure = ' + secure);
  console.log(logging_key + ' send_request - http_method = ' + http_method + ' request_path = ' + request_path);
  request.method = http_method;
  request.path = request_path;
  if (payload) {
    request.body = JSON.stringify(payload);
  }

  if (!!secure === true) {
    console.log(logging_key + ' send_request - signing the request with V4 signature');
    const signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(AWS.config.credentials, new Date());
  }

  return new Promise((resolve, reject) => {
    try {
      console.log(logging_key + ' send_request - sending request ' + request.method + ' - ' + request.headers['Host'] + request.path);
      http_client.handleRequest(request, null,
        response => {
          console.log(logging_key + ` send_request - request response received `);
          const { statusCode, statusMessage, headers } = response;
          console.log(logging_key + ' send_request - statusCode = ' + statusCode + ' statusMessage = ' + statusMessage);
          let body = '';
          response.on('data', chunk => {
            console.log(logging_key + ' send_request - request data received');
            body += chunk;
          });
          response.on('end', () => {
            console.log(logging_key + ' send_request - request ended');
            const data = {
              statusCode,
              statusMessage,
              headers
            };
            if (body) {
              data.body = JSON.parse(body);
            }
            resolve(data);
          });
        },
        error => {
          console.log(logging_key + ' send_request - request error');
          reject(error);
        });
    } catch (error) {
      console.log(logging_key + ' send_request - request failed');
      console.log(error, error.stack);
      reject(error);
    }
  });
}

exports.get_from_search = async (logging_key, request_path, payload = null) => {
  try {
    console.log(logging_key + ' = get_from_search - request_path = ' + request_path + ' payload = ' + JSON.stringify(payload));
    const response = (await send_request(logging_key, 'GET', request_path, payload)).body;
    console.log(logging_key + ` = get_from_search - GET succeeded ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.log(logging_key + ' = get_from_search - failed fetching records from search on ' + request_path);
    console.log(error, error.stack);
    return new Error(error);
  }
};

exports.post_to_search = async (logging_key, request_path, payload = null) => {
  try {
    console.log(logging_key + ' = post_to_search - request_path = ' + request_path + ' payload = ' + JSON.stringify(payload));
    const response = (await send_request(logging_key, 'POST', request_path, payload)).body;
    console.log(logging_key + ` = post_to_search - POST succeeded ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.log(logging_key + ' = post_to_search - failed fetching records from search on ' + request_path);
    console.log(error, error.stack);
    return new Error(error);
  }
};

exports.put_to_search = async (logging_key, request_path, payload = null) => {
  try {
    console.log(logging_key + ' = put_to_search - request_path = ' + request_path + ' payload = ' + JSON.stringify(payload));
    const response = (await send_request(logging_key, 'PUT', request_path, payload)).body;
    console.log(logging_key + ` = put_to_search - PUT succeeded ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.log(logging_key + ' = put_to_search - failed fetching records from search on ' + request_path);
    console.log(error, error.stack);
    return new Error(error);
  }
};

exports.delete_from_search = async (logging_key, request_path) => {
  try {
    console.log(logging_key + ' = delete_from_search - request_path = ' + request_path);
    const response = (await send_request(logging_key, 'DELETE', request_path, null)).body;
    console.log(logging_key + ` = delete_from_search - DELETE succeeded ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.log(logging_key + ' = delete_from_search - failed fetching records from search on ' + request_path);
    console.log(error, error.stack);
    return new Error(error);
  }
};

// https://blog.jayway.com/2018/09/11/aws-elasticsearch-javascript-client/
// https://search-dev1-3ui7lbpkzn7oif6yvy2ikllkse.us-east-1.es.amazonaws.com/_cluster/health
