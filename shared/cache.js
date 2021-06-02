const redis = require('redis');

let cache;
const initiate_cache_connection = (exports.initiate_cache_connection = logging_key => {
  if (cache) {
    console.log(logging_key + ' - connection already open to cache');
    return;
  }
  cache = redis.createClient({
    host: process.env.CACHE_HOST,
    port: process.env.CACHE_PORT,
    retry_strategy: function (options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        // End reconnecting on a specific error and flush all commands with
        // a individual error
        return new Error('The server refused the connection');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout and flush all commands
        // with a individual error
        return new Error('Retry time exhausted');
      }
      if (options.attempt > 10) {
        // End reconnecting with built in error
        return undefined;
      }
      // reconnect after
      return Math.min(options.attempt * 100, 3000);
    }
  });

  cache.on('ready', () => console.log(`${logging_key} = redis client: ready`));
  cache.on('connect', () => console.log(`${logging_key} = redis client: connected`));
  cache.on('error', () => console.log(`${logging_key} = redis client: error`));
  cache.on('end', () => console.log(`${logging_key} = redis client: end`));
  cache.on('warning', () => console.log(`${logging_key} = redis client: warning`));
  return cache;
});

exports.close_cache_connection = logging_key => {
  if (cache) {
    cache.quit();
    cache = undefined;
  }
  console.log(logging_key + ' - closed connection to cache');
};

exports.store_records_to_cache = (key, value, logging_key, options = { EX: 60 * 60 * 48 }) => {
  return new Promise((resolve, reject) => {
    try {
      if (!cache) {
        initiate_cache_connection(logging_key);
      }
      const cache_key = process.env.ENVIRONMENT + '__' + key.toLowerCase().trim();
      console.log(logging_key + ' - store_records_to_cache - cache_key - ' + cache_key + ' options - ' + JSON.stringify(options));
      cache.set(cache_key, value.trim(), 'EX', options.EX, (error, data) => {
        if (error) {
          console.log(error, error.stack);
          reject(error);
        }
        console.log(logging_key + ' store_records_to_cache - ' + cache_key + ' - ' + data);
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.fetch_records_from_cache = (key, logging_key, options) => {
  return new Promise((resolve, reject) => {
    try {
      const cache_key = process.env.ENVIRONMENT + '__' + key.toLowerCase().trim();
      console.log(logging_key + ' - fetch_records_from_cache - cache_key - ' + cache_key);
      if (!cache) {
        initiate_cache_connection(logging_key);
      }
      cache.get(cache_key, (error, value) => {
        if (error) {
          console.log(error, error.stack);
          reject(error);
        }
        // console.log(logging_key + ' fetch_records_from_cache - ' + cache_key + ' - ' + value);
        resolve(value);
      });
    } catch (error) {
      reject(error);
    }
  });
};
