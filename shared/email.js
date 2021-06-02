import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import { notify } from './notify';
import { is_prod } from './utilities';
const sg_mail = require('@sendgrid/mail');

let email_client;

const initialize_email_client = async (logging_key) => {
  try {
    console.log(logging_key + ' - initialize_email_client - initializing client');
    sg_mail.setApiKey(process.env.TRANSACTIONAL_EMAIL_API_KEY);
    email_client = sg_mail;
    console.log(logging_key + ' - initialize_email_client - client initialized');
  } catch (error) {
    const error_id = uuidv4();
    console.log(logging_key + ' - ' + error_id + ' - Exception Occurred !');
    console.log(logging_key + ' - ' + error_id + ' = initialize_email_client Error');
    console.log(`${logging_key} - ${error_id}`, error, error.stack);
    throw error;
  }
};

exports.send_email_with_tracking = async (logging_key, to_email, template_id, payload, options = {}) => {
  try {
    logging_key += ' send_email_with_tracking';
    console.log(`${logging_key} - SEND to_email:${to_email} - template_id:${template_id} - payload:${JSON.stringify(payload)}`);
    // initialize if client not found or required template does not exist in pool
    if (!email_client) {
      await initialize_email_client(logging_key);
    }

    const email_params = {
      to: to_email,
      from: options.from || process.env.TRANSACTIONAL_FROM_EMAIL,
      template_id,
      dynamic_template_data: payload
    };
    // if (!is_prod()) {
    //   email_params['mail_settings'] = {
    //     'sandbox_mode': {
    //       'enable': true
    //     }
    //   };
    // }
    console.log(logging_key + ' Params = ' + JSON.stringify(email_params));
    await email_client.send(email_params);
    console.log(`${logging_key} - SENT to_email:${to_email} - template_id:${template_id} `);
    return 1;
  } catch (error) {
    const error_id = uuidv4();
    console.log(logging_key + ' - ' + error_id + ' - exception occurred !');
    console.log(logging_key + ' - ' + error_id + ' = send_email_with_tracking Error');
    console.log(`${logging_key} - ${error_id}`, error, error.stack);

    const notification_message = {
      environment: process.env.ENVIRONMENT,
      error_id: error_id,
      step: logging_key,
      stacktrace: error.stack,
      message: error.message,
      template_name: template_id,
      to_email
    };
    await notify(logging_key, 'email send error', notification_message);
    throw error;
  }
};
