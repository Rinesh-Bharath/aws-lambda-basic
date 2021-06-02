import { process_data } from './src/process';
import { set_environment } from './shared/env';
const logging_key = 'api-product';

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // Set Environment
  set_environment(logging_key);
  console.log(process.env.ENVIRONMENT);
  console.log(logging_key + ' = event = ' + JSON.stringify(event));
  const response = await process_data(event, logging_key);
  console.log(logging_key + ' = finished processing the data');
  callback(null, response);
};
