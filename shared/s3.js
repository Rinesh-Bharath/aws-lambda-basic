import AWS from 'aws-sdk';
import moment from 'moment';

import { notify } from './notify';

const get_S3_resource = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('getting s3 resource using IAM');
    AWS.config.update({
      region: process.env.S3_REGION
    });
  } else {
    console.log('getting s3 resource using config');
    AWS.config.loadFromPath('./mock/aws.dev.json');
  }
  return new AWS.S3();
};

let s3_client = (exports.s3_client = get_S3_resource());

// Creates new S3 object using aws S3
exports.put_object_to_S3 = async (environment, data, logging_key, file_name, bucket_name, encrypt = true, is_binary = false) => {
  return new Promise(async resolve => {
    if (!file_name) {
      file_name = get_S3_file_name(environment, logging_key);
    }
    try {
      console.log(logging_key + ' = put_object_to_S3 - started for ' + file_name);
      if (!s3_client) {
        s3_client = get_S3_resource();
      }
      if (!is_binary) {
        data = typeof (data) === 'string' ? data : JSON.stringify(data);
      }
      const params = {
        Bucket: bucket_name != null ? bucket_name : process.env.CONTENT_S3_BUCKET_NAME, // bucket on s3
        Key: file_name, // filename
        Body: data // contents
      };
      if (encrypt) {
        params.ServerSideEncryption = 'aws:kms';
        params.SSEKMSKeyId = process.env.S3_SSE_KMS_ARN;
      }
      s3_client.putObject(params, async (err, data) => {
        try {
          if (err) throw err;
          console.log(`file uploaded key: ${file_name}`);
          resolve(params.Key);
        } catch (error) {
          console.log(error, error.stack);
          const notification_message = {
            environment: process.env.ENVIRONMENT,
            step: logging_key,
            message: `${logging_key} - s3 - file write failed - ${file_name}`
          };
          await notify('aws s3 error', notification_message, logging_key);
        }
      });
      console.log(logging_key + ' = put_object_to_S3 - finished for ' + file_name);
    } catch (error) {
      console.log(error, error.stack);
      const notification_message = {
        environment: process.env.ENVIRONMENT,
        step: logging_key,
        message: `${logging_key} - s3 - file write failed - ${file_name}`
      };
      await notify('aws s3 error', notification_message, logging_key);
    }
  });
};

exports.put_object_acl_at_S3 = async (logging_key, bucket_name, file_name, acl = 'public-read') => {
  return new Promise(async resolve => {
    try {
      console.log(logging_key + ' = put_object_acl_at_S3 - started for ' + file_name);
      if (!s3_client) {
        s3_client = get_S3_resource();
      }
      const params = {
        Bucket: bucket_name != null ? bucket_name : process.env.CONTENT_S3_BUCKET_NAME, // bucket on s3
        Key: file_name,
        ACL: acl
      };
      s3_client.putObjectAcl(params, async (err, data) => {
        try {
          if (err) throw err;
          console.log(`put_object_acl_at_S3 file_name: ${file_name}`);
          resolve(params.Key);
        } catch (error) {
          console.log(error, error.stack);
          const notification_message = {
            environment: process.env.ENVIRONMENT,
            step: logging_key,
            message: `${logging_key} - s3 - put_object_acl_at_S3 failed - ${file_name}`
          };
          await notify('aws s3 error', notification_message, logging_key);
        }
      });
      console.log(logging_key + ' = put_object_acl_at_S3 - finished for ' + file_name);
    } catch (error) {
      console.log(error, error.stack);
      const notification_message = {
        environment: process.env.ENVIRONMENT,
        step: logging_key,
        message: `${logging_key} - s3 - put_object_acl_at_S3 failed - ${file_name}`
      };
      await notify('aws s3 error', notification_message, logging_key);
    }
  });
};


// Fetches S3 object using aws S3
exports.get_object_from_S3 = async (object_id, logging_key) => {
  return new Promise(async resolve => {
    try {
      console.log(logging_key + ' = get_object_from_S3 - started for ' + object_id);
      if (!s3_client) {
        s3_client = get_S3_resource();
      }
      const params = {
        Bucket: process.env.CONTENT_S3_BUCKET_NAME, // bucket on s3
        Key: object_id // filename
      };
      s3_client.getObject(params, async (err, data) => {
        try {
          if (err) throw err;
          else resolve(data.Body.toString());
        } catch (error) {
          console.log(error, error.stack);
          const notification_message = {
            environment: process.env.ENVIRONMENT,
            step: logging_key,
            message: `${logging_key} - s3 - file read failed - ${object_id}`
          };
          await notify('aws s3 error', notification_message, logging_key);
        }
      });
      console.log(logging_key + ' = get_object_from_S3 - finished for ' + object_id);
    } catch (error) {
      console.log(error, error.stack);
      const notification_message = {
        environment: process.env.ENVIRONMENT,
        step: logging_key,
        message: `${logging_key} - s3 - file read failed - ${object_id}`
      };
      await notify('aws s3 error', notification_message, logging_key);
    }
  });
};

// aws S3 file link generator
exports.get_S3_file_link = object_id => {
  const link = `https://s3.amazonaws.com/${process.env.CONTENT_S3_BUCKET_NAME}/${object_id}`;
  console.log(`s3 file link - ${link}`);
  return link;
};

const get_S3_file_name = (exports.get_S3_file_name = (environment, logging_key, filename, extension = 'json') => {
  return (
    (filename || moment().format('YYYY') + '/' + moment().format('MM') + '/' + moment().format('DD') + '/' + logging_key + '-' + environment + '-' + moment().format('HH-mm-ss-SSS')) + '.' + extension
  );
});
