import AWS from 'aws-sdk';

// Notify support using AWS SNS
exports.notify = async (subject, json_message, logging_key, arn) => {
  return new Promise(resolve => {
    try {
      if (process.env.NODE_ENV === 'production') {
        console.log(logging_key + ' notify - using iam role');
        AWS.config.update({
          region: process.env.SNS_REGION
        });
      } else {
        console.log(logging_key + ' notify - using local credentials');
        AWS.config.loadFromPath('./mock/aws.dev.json');
      }

      // fetch only service name from logging_key

      const _subject = `${subject || 'Back-end process failure notification'} - ${logging_key.split(' ')[0]}`;
      const sns = new AWS.SNS();
      sns.publish(
        {
          Subject: _subject.slice(0, 100),
          Message: JSON.stringify(json_message),
          TopicArn: arn || process.env.NOTIFICATION_ARN
        },
        (err, data) => {
          try {
            if (err) {
              throw err;
            }
            console.log(logging_key + ' notify - sns informed of completion ' + JSON.stringify(data));
            resolve(data);
          } catch (err) {
            console.log(logging_key + ' - notify - Exception Occurred');
            console.log(logging_key + ' - notify - error during sns publish');
            console.log(logging_key, '-', err, err.stack);
            resolve();
          }
        }
      );
    } catch (err) {
      console.log(logging_key + ' - notify - Exception Occurred');
      console.log(logging_key, '-', err, err.stack);
      resolve();
    }
  });
};

exports.notify_via_eMail = async (subject, email_addresses, email_message, logging_key) => {
  return new Promise(async resolve => {
    try {
      if (process.env.NODE_ENV === 'production') {
        console.log(logging_key + ' notify_via_eMail - using iam role');
        AWS.config.update({
          region: process.env.EMAIL_REGION
        });
      } else {
        console.log(logging_key + ' notify_via_eMail - using local credentials');
        AWS.config.loadFromPath('./mock/aws.dev.json');
      }

      const ses = new AWS.SES();
      const email_params = {
        Destination: {
          ToAddresses: [email_addresses]
        },
        Message: {
          Body: {
            Text: {
              Charset: 'UTF-8',
              Data: email_message
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject
          }
        },
        Source: process.env.EMAIL_SOURCE,
        ReplyToAddresses: [process.env.EMAIL_REPLY_TO_ADDRESS]
      };

      ses.sendEmail(email_params, (err, data) => {
        try {
          if (err) {
            throw err;
          }
          console.log(logging_key + ' notify_via_eMail - ses informed of completion ' + JSON.stringify(data));
          resolve(data);
        } catch (err) {
          console.log(logging_key + ' - notify_via_eMail - Exception Occurred');
          console.log(logging_key + ' - notify_via_eMail - error during ses publish');
          console.log(logging_key, '-', err, err.stack);
          resolve();
        }
      });
    } catch (err) {
      console.log(logging_key + ' - notify_via_eMail - Exception Occurred');
      console.log(logging_key, '-', err, err.stack);
      resolve();
    }
  });
};
