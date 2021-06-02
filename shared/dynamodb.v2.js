import AWS from 'aws-sdk';
import { wait } from './utilities';

function get_log (logging_key = '') {
  return (...messages) => console.log(`${logging_key} -`, ...messages);
}

const get_dynamodb_client = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('getting db resource using IAM');
    AWS.config.update({
      region: process.env.DB_REGION
    });
  } else {
    console.log('getting db resource using config');
    AWS.config.loadFromPath('./mock/aws.dev.json');
  }
  return new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
  });
};

const doc_client = get_dynamodb_client();

async function insert (params, logging_key) {
  const log = get_log(logging_key);

  log(`Inserting record in ${params.TableName}`);
  const data = await doc_client.put(params).promise();
  log(`Record inserted in ${params.TableName}`);
  return data;
}

async function batch_write (object_array, logging_key) {
  const log = get_log(logging_key);

  const source_params = {
    RequestItems: {}
  };
  object_array.forEach(object => {
    const records = [];
    object.items.forEach(item => {
      records.push({
        PutRequest: {
          Item: item
        }
      });
    });
    source_params.RequestItems[object.table_name] = records;
  });

  async function on_batch_write (source_params, logging_key, retry_count = 0) {
    if (retry_count > 40) throw new Error(`Maximum retry to process unprocessed items exceeded (40)`);
    log(`Inserting record using batchWrite`);
    const data = await doc_client.batchWrite(source_params).promise();
    log(`Record inserted using batchWrite`);

    if (Object.keys(data.UnprocessedItems).length > 0) {
      retry_count++;
      source_params.RequestItems = data.UnprocessedItems;
      await wait(100);
      log(`Retrying unprocessed items after 100 ms - Retry ${retry_count}`);
      return on_batch_write(source_params, logging_key, retry_count);
    }
    return data;
  }

  return on_batch_write(source_params, logging_key);
}

module.exports = { dynamodb: { insert, batch_write } };
