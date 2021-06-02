import AWS from 'aws-sdk';
import _ from 'lodash';
import uuid from 'uuid/v4';

const get_DB_document_resource = () => {
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

const get_DB_resource = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('getting db resource using IAM');
    AWS.config.update({
      region: process.env.DB_REGION
    });
  } else {
    console.log('getting db resource using config');
    AWS.config.loadFromPath('./mock/aws.dev.json');
  }
  return new AWS.DynamoDB({
    convertEmptyValues: true
  });
};

const doc_client = (exports.doc_client = get_DB_document_resource());
const db_client = (exports.db_client = get_DB_resource());

exports.insert_record_into_DB = (params, logging_key) => {
  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = insert_record_into_DB adding a new item to table ' + params.TableName);
    // console.log(logging_key + ' = insert_record_into_DB params ' + params.TableName + JSON.stringify(params));
    doc_client.put(params, (err, data) => {
      if (err) {
        console.log(logging_key + ' = insert_record_into_DB failed adding a new item to table ' + params.TableName);
        const message = error_message('insert_record_into_DB', err, logging_key);
        console.log(err, err.stack);
        reject(new Error(message));
      } else {
        console.log(logging_key + ' = insert_record_into_DB added a new item to table ' + params.TableName);
        resolve(data);
      }
    });
  });
};

exports.batch_write_records_in_DB = (object_array, logging_key, send_event_switch = true) => {
  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = starting batch_write');
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
      if (send_event_switch) {
        console.log(logging_key + ' = send_event_switch');
        // TODO any CQRS events
      }
    });

    doc_client.batchWrite(source_params, (err, data) => {
      if (err) {
        console.log(logging_key + ' = batch_write_records_in_DB failed updating an batch items to table/s ');
        const message = error_message('batch_write_records_in_DB', err, logging_key);
        console.log(err, err.stack);
        reject(new Error(message));
      } else {
        // if (Object.keys(data.UnprocessedItems).length !== 0)
        //   return reject(new Error('Partial Batch write, will be treated as db failed record'));
        console.log(logging_key + ' = batch_write_records_in_DB updated batch items to table/s');
        resolve(data, logging_key);
      }
    });
  });
};

exports.update_record_in_DB = (params, logging_key) => {
  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = update_record_in_DB updating item in table ' + params.TableName);
    console.log(logging_key + ' = update_record_in_DB params ' + params.TableName + JSON.stringify(params));
    doc_client.update(params, (err, data) => {
      if (err) {
        console.log(logging_key + ' = update_record_in_DB failed updating item in table ' + params.TableName);
        const message = error_message('update_record_in_DB', err, logging_key);
        console.log(err, err.stack);
        reject(new Error(message));
      } else {
        console.log(logging_key + ' = update_record_in_DB updated item to table ' + params.TableName);
        resolve(data);
      }
    });
  });
};

exports.query_records_from_DB = (params, logging_key) => {
  const result = {
    Items: [],
    Count: 0,
    ScannedCount: 0
  };

  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = query_records_from_DB fetching records ...');
    console.log(logging_key + ' = query_records_from_DB params = ' + JSON.stringify(params));
    doc_client.query(params, (err, data) => on_query(params, err, data, resolve, reject));
  });

  function on_query (params, err, data, resolve, reject) {
    if (err) {
      console.error('Unable to query the table. Error JSON:', JSON.stringify(err, null, 2));
      const message = error_message('query_records_from_DB', err, logging_key);
      console.log(err, err.stack);
      reject(new Error(message));
    } else {
      console.log('query succeeded.');
      if (data.Items.length) {
        result.Items = _.concat(result.Items, data.Items);
        result.Count += data.Count;
        result.ScannedCount += data.ScannedCount;
      }
      // query can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey !== 'undefined') {
        console.log('querying for more ...');
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        return doc_client.query(params, (err, data) => on_query(params, err, data, resolve, reject));
      }
      return resolve(result);
    }
  }
};

exports.scan_records_at_DB = (params, logging_key) => {
  const result = {
    Items: [],
    Count: 0,
    ScannedCount: 0
  };

  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = scan_records_at_DB scanning records ...');
    console.log(logging_key + ' = scan_records_at_DB params = ' + JSON.stringify(params));
    doc_client.scan(params, (err, data) => on_scan(params, err, data, resolve, reject));
  });

  function on_scan (params, err, data, resolve, reject) {
    if (err) {
      console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
      const message = error_message('scan_records_at_DB', err, logging_key);
      console.log(err, err.stack);
      reject(new Error(message));
    } else {
      console.log('Scan succeeded.');
      if (data.Items.length) {
        result.Items = _.concat(result.Items, data.Items);
        result.Count += data.Count;
        result.ScannedCount += data.ScannedCount;
      }
      // scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey !== 'undefined') {
        console.log('Scanning for more ...');
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        return doc_client.scan(params, (err, data) => on_scan(params, err, data, resolve, reject));
      }
      return resolve(result);
    }
  }
};

exports.batch_get_records_from_DB = (params, logging_key) => {
  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = batch_get_records_from_DB fetching records ...');
    console.log(logging_key + ' = batch_get_records_from_DB params = ' + JSON.stringify(params));
    doc_client.batchGet(params, (err, data) => {
      if (err) {
        console.log(logging_key + ' = batch_get_records_from_DB fetching records failed');
        const message = error_message('batch_get_records_from_DB', err, logging_key);
        console.log(err, err.stack);
        reject(new Error(message));
      } else {
        console.log(logging_key + ' = batch_get_records_from_DB fetching records returned results ');
        resolve(data);
      }
    });
  });
};

exports.delete_record_from_DB = (params, logging_key) => {
  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = delete_record_from_DB removing an existing item from table ' + params.TableName);
    console.log(logging_key + ' = delete_record_from_DB params ' + params.TableName + JSON.stringify(params));
    doc_client.delete(params, (err, data) => {
      if (err) {
        console.log(logging_key + ' = delete_record_from_DB failed removing an existing item from table ' + params.TableName);
        const message = error_message('delete_record_from_DB', err, logging_key);
        console.log(err, err.stack);
        reject(new Error(message));
      } else {
        console.log(logging_key + ' = delete_record_from_DB removed an existing item from table ' + params.TableName);
        resolve(data);
      }
    });
  });
};

exports.describe_table = (table_name, logging_key) => {
  const primary_keys = [];
  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = describe_table ' + table_name);
    db_client.describeTable({ TableName: table_name }, (err, data) => {
      if (err) {
        console.log(logging_key + ' = describe_table failed ' + table_name);
        const message = error_message('describe_table', err, logging_key);
        console.log(err, err.stack);
        reject(new Error(message));
      } else {
        data.Table.KeySchema.forEach(element => {
          primary_keys.push(element.AttributeName);
        });
        console.log(logging_key + ' describe_table - primary_keys = ' + JSON.stringify(primary_keys));
        resolve(primary_keys);
      }
    });
  });
};

function error_message (function_name, error, logging_key) {
  // error_id helps to filter in insights
  const error_id = uuid();
  let message = 'error_' + function_name + ' ' + error_id;
  console.log(logging_key + ' = ' + message + ' error_name ' + error.name);
  console.log(logging_key + ' = ' + message + ' error_message ' + error.message);
  console.log(logging_key + ' = ' + message + ' error_statusCode ' + error.statusCode);
  console.log(logging_key + ' = ' + message + ' error_requestId ' + error.requestId);
  console.log(logging_key + ' = ' + message + ' error_retryable ' + error.retryable);
  message += '=' + error.message;
  return message;
}
