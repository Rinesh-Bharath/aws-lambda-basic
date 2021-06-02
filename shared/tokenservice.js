'use strict';
import { query_records_from_DB } from './dynamodb';
import { notify } from './notify';

exports.get_cms_api_token = logging_key => {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        TableName: process.env.TABLE_PROPERTIES,
        KeyConditionExpression: '#c = :cid',
        ExpressionAttributeNames: {
          '#c': 'key'
        },
        ExpressionAttributeValues: {
          ':cid': process.env.CMS_API_CLIENT_ID
        }
      };
      const data = await query_records_from_DB(params, logging_key);
      data.Items.forEach(item => {
        console.log(logging_key + ' = CMS API token returned');
        return resolve(item.MapAttribute.auth_token);
      });
    } catch (error) {
      const notification_message = {
        environment: process.env.ENVIRONMENT,
        step: logging_key,
        stacktrace: error.stack,
        message: `${logging_key} - get_cms_api_token failed.`
      };
      await notify('token error', notification_message, logging_key);
      return reject(new Error('token error'));
    }
  });
};
