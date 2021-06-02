import AWS from 'aws-sdk';

exports.invoke = async (action, json_message, logging_key, functionName) => {
  return new Promise(resolve => {
    try {
      if (process.env.NODE_ENV === 'production') {
        console.log(logging_key + ' invoke - using iam role');
        AWS.config.update({
          region: process.env.SNS_REGION
        });
      } else {
        console.log(logging_key + ' invoke - using local credentials');
        AWS.config.loadFromPath('./mock/aws.dev.json');
      }
      const Lambda = new AWS.Lambda();
      const payload = {
        action: action,
        body: {
          input: json_message
        }
      };
      const req = {
        FunctionName: functionName,
        Payload: JSON.stringify(payload)
      };
      console.log(logging_key + ' invoking lambda with request ' + JSON.stringify(req));
      Lambda.invoke(req, (err, data) => {
        try {
          if (err) {
            throw err;
          }
          console.log(logging_key + ' invoked informed of completion ' + JSON.stringify(data));
          const response = JSON.parse(data.Payload);
          resolve(response.data);
        } catch (err) {
          console.log(logging_key + ' - invoke - Exception Occurred');
          console.log(logging_key + ' - invoke - error during lambda invoke');
          console.log(logging_key, '-', err, err.stack);
          resolve();
        }
      });
    } catch (err) {
      console.log(logging_key + ' - invoke - Exception Occurred');
      console.log(logging_key, '-', err, err.stack);
      resolve();
    }
  });
};
