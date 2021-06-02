import { process_data } from './src/process';
import { set_local_environment } from './shared/env';
const logging_key = 'ki-api-feed';

exports.handler = async (event, context, callback) => {
  // Set Environment
  context.callbackWaitsForEmptyEventLoop = false;
  set_local_environment(logging_key);
  console.log(process.env.ENVIRONMENT);
  console.log(logging_key + ' = event = ' + JSON.stringify(event));
  const response = await process_data(event, logging_key);
  console.log(logging_key + ' = finished processing the data');
  callback(null, response);
};
