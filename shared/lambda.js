import AWS from 'aws-sdk';

const lambda = () => {
  if (process.env.NODE_ENV === 'production') {
    AWS.config.update({
      region: process.env.AWS_REGION
    });
  } else {
    AWS.config.loadFromPath('./mock/aws.dev.json');
  }
  return new AWS.Lambda();
};

const lambda_client = lambda();

// Execute Lambda Functions
exports.execute_lambda = (params, logging_key) => {
  return new Promise((resolve, reject) => {
    try {
      if (params.Payload) {
        console.log(`${logging_key} - lambda payload - ${params.Payload}`);
      }

      lambda_client.invoke(params, async (err, data) => {
        try {
          if (err) {
            console.log(`${logging_key} - ${params.FunctionName} - failed`);
            console.log(logging_key, err);
            return reject(err);
          }
          console.log(`${logging_key} - ${params.FunctionName} - succeeded`);
          const result = JSON.parse(data.Payload);
          resolve(result);
        } catch (err) {
          console.log(`${logging_key} - Unable to Execute Lambda`);
          console.log(logging_key, err, err.stack);
          reject(err);
        }
      });
    } catch (err) {
      console.log(`${logging_key} - Unable to Execute Lambda`);
      console.log(logging_key, err, err.stack);
      reject(err);
    }
  });
};
