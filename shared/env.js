export function set_environment (logging_key = 'nodejs-express', environment = 'development') {
  console.log(`${logging_key} setting environment variables for local run`);

  process.env.NODE_ENV = 'development';
  process.env.NODE_PORT = '3000';
  process.env.ENVIRONMENT = environment;
  process.env.DB_REGION = 'us-east-1';
  process.env.TABLE_USER = `user_${environment}`;
  process.env.TABLE_PRODUCT = `product_${environment}`;
  process.env.MONGO_DB_URI = `mongodb+srv://apiUser:ZN2Le05QSfinUw4w@nodejs-express-1.wsugg.mongodb.net/${environment}?retryWrites=true&w=majority`;
  process.env.JWT_ACCESS_SECRET = 'p@ssw0rd!';
  process.env.JWT_ACCESS_EXPIRES = '1h';
  process.env.JWT_ACCESS_TYPE = 'Bearer';
  process.env.JWT_REFRESH_SECRET = 'w0rd!p@ss';
  process.env.JWT_REFRESH_EXPIRES = '1d';
  process.env.JWT_REFRESH_TYPE = 'Refresh';
};
