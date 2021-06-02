import { doc_client } from './dynamodb';

const uuid = require('uuid/v4');

exports.save_error = (logging_key, context_id, feature_type, object_id, stack_trace, error_id) => {
  return new Promise(resolve => {
    try {
      console.log(logging_key + ' = save_error adding a new item to error table');
      const error_record = {
        error_id: error_id || uuid(),
        context_id: context_id || 'context_id_unknown',
        feature_type: feature_type || 'backend_unknown',
        object_id: object_id,
        status: 'new',
        resolution_reason: 'to_be_analysed',
        time_stamp: new Date().toISOString().split('T')[0],
        stack_trace: stack_trace
      };
      const params = {
        TableName: process.env.TABLE_ERROR,
        Item: error_record
      };
      doc_client.put(params, (err, data) => {
        try {
          if (err) {
            console.log(logging_key + ' = save_error failed adding a new item to error table');
            console.log(err, err.stack);
          } else {
            console.log(logging_key + ' = save_error added a new item to error table');
          }
          resolve(error_record.error_id);
        } catch (error) {
          resolve(error_record.error_id);
        }
      });
    } catch (error) {
      resolve(error_id);
    }
  });
};
