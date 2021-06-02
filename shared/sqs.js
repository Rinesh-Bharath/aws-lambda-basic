import AWS from 'aws-sdk';
import {
  notify
} from './notify';

const get_SQS_resource = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('getting sqs resource using IAM');
    AWS.config.loadFromPath('./mock/aws.dev.json');
  } else {
    console.log('getting sqs resource using config');
    AWS.config.update({
      region: process.env.SQS_REGION
    });
  }
  return new AWS.SQS();
};

exports.send_SQS_message = async (logging_key, queue_name, message_payload) => {
  return new Promise(async resolve => {
    try {
      const sqs = get_SQS_resource();
      const sqs_params = {
        MessageBody: JSON.stringify(message_payload),
        QueueUrl: process.env.SQS_BASE_URL + queue_name
      };

      // add MessageGroupId for sequential processing of messages, FIFO order
      if (queue_name.includes('.fifo')) {
        sqs_params.MessageGroupId = queue_name;
      }

      console.log(`${logging_key}, ${JSON.stringify(message_payload)} has been requested to put in ${queue_name}`);
      sqs.sendMessage(sqs_params, async (err, data) => {
        try {
          if (err) {
            console.log(logging_key + ' = sqs send_message error ');
            console.log(err, err.stack);
          }
          console.log(logging_key + ' = message_payload had been successfully sent to ' + queue_name);
          console.log(logging_key + ' = sqs response data ' + JSON.stringify(data));
          resolve(data);
        } catch (error) {
          const notification_message = {
            environment: process.env.ENVIRONMENT,
            step: logging_key,
            stacktrace: error.stack,
            message: `${logging_key} - SQS - SQS failure - ${queue_name}`
          };
          await notify('SQS Error', notification_message, logging_key);
          resolve();
        }
      });
    } catch (error) {
      const notification_message = {
        environment: process.env.ENVIRONMENT,
        step: logging_key,
        stacktrace: error.stack,
        message: `${logging_key} - SQS - SQS failure - ${queue_name}`
      };
      await notify('SQS Error', notification_message, logging_key);
      resolve();
    }
  });
};

exports.purge_Q = (logging_key, queue_name) => {
  return new Promise((resolve, reject) => {
      const sqs = get_SQS_resource();
      const params = {
          QueueUrl: process.env.SQS_BASE_URL + queue_name
      };
      console.log(logging_key + ' - purge_Q PURGING '+ queue_name);
      sqs.purgeQueue(params, (err, data) => {
          if (err) {
              return reject(err);
          }
          console.log(logging_key + ' - purge_Q PURGED '+ queue_name);
          return resolve();
      });
  });
}
