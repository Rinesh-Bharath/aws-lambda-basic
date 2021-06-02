import uuid from 'uuid/v4';
import mongoose from 'mongoose';
mongoose.Promise = Promise;

let connection;

const get_mongodb_resource = async () => {
  try {
    console.log('get_mongodb_resource started ');
    const options = { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true };
    await mongoose.connect(process.env.MONGO_DB_URI, options);
    mongoose.set('debug', true);
    console.info('get_mongodb_resource connected');
    connection = mongoose.connection;
    return mongoose.connection;
  } catch (error) {
    console.log(error, error.stack);
    console.log('connection to mongodb failed');
    return new Error(error);
  }
};

// const mongodb_client = (exports.mongodb_client = get_mongodb_resource());

exports.fetch_one_from_db = async (logging_key, collection_name = '', filter = {}, project = {}, options = { limit: 0, skip: 0 }) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = fetch_from_db initializing ...');
    console.log(logging_key + ' = fetch_from_db params = ' + JSON.stringify({ collection_name, filter, project, options }));
    const collection = await connection.db.collection(collection_name);
    const resultset_obj = await collection.findOne(filter)
    console.log(logging_key + ' = fetch_from_db query succeeded');
    return resultset_obj;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = fetch_from_db failed fetching records from DB ' + collection_name);
    const message = error_message('fetch_from_db failed fetching records from DB', error, logging_key);
    return new Error(message);
  }
};

exports.fetch_from_db = async (logging_key, collection_name = '', filter = {}, project = {}, options = { limit: 0, skip: 0 }) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = fetch_from_db initializing ...');
    console.log(logging_key + ' = fetch_from_db params = ' + JSON.stringify({ collection_name, filter, project, options }));
    const collection = await connection.db.collection(collection_name);
    const resultset_array = await collection
      .find(filter)
      .project(project)
      .limit(options.limit)
      .skip(options.skip)
      .toArray();
    console.log(logging_key + ' = fetch_from_db query succeeded');
    return resultset_array;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = fetch_from_db failed fetching records from DB ' + collection_name);
    const message = error_message('fetch_from_db failed fetching records from DB', error, logging_key);
    return new Error(message);
  }
};

exports.aggregate_from_db = async (logging_key, collection_name = '', query = [], project = {}, options = { limit: 0, skip: 0 }) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = aggregate_from_db initializing ...');
    console.log(logging_key + ' = aggregate_from_db params = ' + JSON.stringify({ collection_name, query, project, options }));
    const collection = await connection.db.collection(collection_name);
    const resultset_array = await collection
      .aggregate(query).toArray();
    console.log(logging_key + ' = aggregate_from_db query succeeded');
    return resultset_array;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = aggregate_from_db failed fetching records from DB ' + collection_name);
    const message = error_message('aggregate_from_db failed fetching records from DB', error, logging_key);
    return new Error(message);
  }
};

exports.insert_into_db = async (logging_key, collection_name = '', data = {}) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = insert_into_db initializing ...');
    console.log(logging_key + ' = insert_into_db params = ' + JSON.stringify({ collection_name, data }));
    const collection = await connection.db.collection(collection_name);
    const result = await collection.insertOne(data);
    console.log(logging_key + ' = insert_into_db query succeeded!');
    return result && result.ops[0];
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = insert_into_db failed inserting into DB ' + collection_name);
    const message = error_message('insert_into_db failed inserting into DB', error, logging_key);
    return new Error(message);
  }
};

exports.insert_many_into_db = async (logging_key, collection_name = '', data = []) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = insert_many_into_db initializing ...');
    console.log(logging_key + ' = insert_many_into_db params = ' + JSON.stringify({ collection_name, data }));
    const collection = await connection.db.collection(collection_name);
    const result = await collection.insertMany(data);
    console.log(logging_key + ' = insert_many_into_db query succeeded!');
    return result && result.ops;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = insert_many_into_db failed inserting into DB ' + collection_name);
    const message = error_message('insert_many_into_db failed inserting into DB', error, logging_key);
    return new Error(message);
  }
};

exports.update_into_db = async (logging_key, collection_name = '', filter = {}, update = {}, options = { returnOriginal: false }) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = update_into_db initializing ...');
    console.log(logging_key + ' = update_into_db params = ' + JSON.stringify({ collection_name, filter, update, options }));
    const collection = await connection.db.collection(collection_name);
    const result = await collection.findOneAndUpdate(filter, update, options);
    console.log(logging_key + ' = update_into_db query succeeded!');
    return result;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = update_into_db failed updating into DB ' + collection_name);
    const message = error_message('update_into_db failed updating into DB', error, logging_key);
    return new Error(message);
  }
};

exports.update_many_into_db = async (logging_key, collection_name = '', filter = {}, update = {}, options = { multi: true, returnOriginal: false }) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = update_into_db initializing ...');
    console.log(logging_key + ' = update_into_db params = ' + JSON.stringify({ collection_name, filter, update, options }));
    const collection = await connection.db.collection(collection_name);
    const result = await collection.update(filter, update, options);
    console.log(logging_key + ' = update_into_db query succeeded!');
    return result;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = update_into_db failed updating into DB ' + collection_name);
    const message = error_message('update_into_db failed updating into DB', error, logging_key);
    return new Error(message);
  }
};

exports.remove_from_db = async (logging_key, collection_name = '', filter = {}) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = remove_from_db initializing ...');
    console.log(logging_key + ' = remove_from_db params = ' + JSON.stringify({ collection_name, filter }));
    const collection = await connection.db.collection(collection_name);
    const result = await collection.deleteMany(filter);
    console.log(logging_key + ' = remove_from_db query succeeded!');
    return result;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = remove_from_db failed removing from DB ' + collection_name);
    const message = error_message('remove_from_db failed removing from DB', error, logging_key);
    return new Error(message);
  }
};

exports.create_collection = async (logging_key, collection_name = '', options = {}) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = remove_collection initializing ...');
    console.log(logging_key + ' = remove_collection params = ' + JSON.stringify({ collection_name, options }));
    const result = await connection.db.createCollection(collection_name);
    console.log(logging_key + ' = remove_collection query succeeded!');
    return result;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = remove_collection failed removing from DB ' + collection_name);
    const message = error_message('remove_collection failed removing from DB', error, logging_key);
    return new Error(message);
  }
};

exports.drop_collection = async (logging_key, collection_name = '', filter = {}) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = remove_collection initializing ...');
    console.log(logging_key + ' = remove_collection params = ' + JSON.stringify({ collection_name, filter }));
    const collection = await connection.db.collection(collection_name);
    const result = await collection.drop(filter);
    console.log(logging_key + ' = remove_collection query succeeded!');
    return result;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = remove_collection failed removing from DB ' + collection_name);
    const message = error_message('remove_collection failed removing from DB', error, logging_key);
    return new Error(message);
  }
};

exports.update_in_bulk = async (logging_key, collection_name = '', filter = [], update = []) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    console.log(logging_key + ' = update_in_bulk initializing ...');
    console.log(logging_key + ' = update_in_bulk params = ' + JSON.stringify({ collection_name, filter, update }));
    const collection = await connection.db.collection(collection_name);
    const bulk = collection.initializeUnorderedBulkOp();

    for (let i = 0; i < filter.length; i++) {
      bulk.find(filter[i]).update(update[i]);
    }

    const result = await bulk.execute();
    console.log(logging_key + ' = update_in_bulk query succeeded!');
    return result;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = update_in_bulk failed updating into DB ' + collection_name);
    const message = error_message('update_in_bulk failed updating into DB', error, logging_key);
    return new Error(message);
  }
};

exports.read_data_in_batch = async (logging_key, collection_name = '', batchSize = 50) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    const cursor = await connection.db
      .collection(collection_name)
      .find()
      .batchSize(batchSize);
    return cursor;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = read_data_in_batch failed to read data from into DB ' + collection_name);
    const message = error_message('read_data_in_batch failed to read data from into DB', error, logging_key);
    return new Error(message);
  }
};

exports.list_collections = async (logging_key) => {
  try {
    if (!connection) {
      await get_mongodb_resource();
    }
    const cursor = await connection.db
      .listCollections()
      .toArray();
    return cursor;
  } catch (error) {
    console.log(error, error.stack);
    console.log(logging_key + ' = list_collections failed to read data from into DB ');
    const message = error_message('list_collections failed to read data from into DB', error, logging_key);
    return new Error(message);
  }
};

function error_message (function_name, error, logging_key) {
  // error_id helps to filter in insights
  const error_id = uuid();
  let message = 'error_' + function_name + ' ' + error_id;
  console.log(logging_key + ' = ' + message + ' error_name ' + error.name);
  console.log(logging_key + ' = ' + message + ' error_message ' + error.message);
  console.log(logging_key + ' = ' + message + ' error_statusCode ' + error.statusCode);
  console.log(logging_key + ' = ' + message + ' error_requestId ' + error.requestId);
  console.log(logging_key + ' = ' + message + ' error_retryable ' + error.retryable);
  message += '=' + error.message;
  return message;
}
