const AWS = require('aws-sdk');

const get_cognito_resource = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('getting cognito_ resource using IAM');
    AWS.config.update({
      region: process.env.AWS_REGION
    });
  } else {
    console.log('getting cognito_ resource using config');
    AWS.config.loadFromPath('./mock/aws.dev.json');
  }
  return new AWS.CognitoIdentityServiceProvider();
};

const cognito_client = (exports.cognito_client = get_cognito_resource());

exports.list_users_from_cognito = (params, logging_key) => {
  const result = { Users: [] };

  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = list_users_from_cognito fetching records ...');
    console.log(logging_key + ' = list_users_from_cognito params = ' + JSON.stringify(params));
    cognito_client.listUsers(params, (err, data) => on_query(params, err, data, resolve, reject));
  });

  function on_query (params, err, data, resolve, reject) {
    if (err) {
      console.error('Unable to list_users cognito. Error JSON:', JSON.stringify(err, null, 2));
      reject(new Error('Unable to list_users cognito. Error'));
    } else {
      result.Users = result.Users.concat(data.Users);
      console.log('list_users succeeded.');
      if (result.Users.length > 1000) {
        console.log('list_users succeeded. result.Users > 1000 - ' + result.Users.length);
        return resolve(result);
      }
      if (data.PaginationToken) {
        console.log('querying for more users , starting from ' + data.PaginationToken);
        params.PaginationToken = data.PaginationToken;
        return cognito_client.listUsers(params, (err, data) => on_query(params, err, data, resolve, reject));
      }
      return resolve(result);
    }
  }
};

exports.admin_create_user = (params, logging_key) => {
  return new Promise((resolve, reject) => {
    console.log(logging_key + ' = admin_create_user params = ' + JSON.stringify(params));
    cognito_client.adminCreateUser(params, function(err, data) {
      if (err) {
        console.error('admin_create_user. Error JSON:', JSON.stringify(err, null, 2));
        reject(new Error('admin_create_user error'));
      } else {
        console.log(logging_key + ' = admin_create_user data = ' + JSON.stringify(data));
        resolve(data);
      } 
    });
  });
};
