import { fetch_one_from_db } from '../../shared/mongodb';

const isRequired = (key) => {
  throw Error(`${key} value cannot be undefined`);
};

exports.validate_place_id = async (logging_key, place_id = isRequired('place_id')) => {
  try {
    const filter = {
      place_id
    };
    const place_in_db = await fetch_one_from_db(logging_key, process.env.TABLE_PLACE, filter);
    if (!place_in_db) {
      throw Error(`place_id: ${place_id} doesn't exists`);
    }
    return place_in_db;
  } catch (error) {
    throw error;
  }
};

exports.validate_feed_id_exist = async (logging_key, feed_id = isRequired('feed_id')) => {
  try {
    const filter = {
      feed_id
    };
    const feed_in_db = await fetch_one_from_db(logging_key, process.env.TABLE_FEED, filter);
    if (feed_in_db) {
      throw Error(`feed_id: ${feed_id} already exists`);
    }
  } catch (error) {
    throw error;
  }
};

exports.validate_feed_id = async (logging_key, feed_id = isRequired('feed_id')) => {
  try {
    const filter = {
      feed_id
    };
    const feed_in_db = await fetch_one_from_db(logging_key, process.env.TABLE_FEED, filter);
    if (!feed_in_db) {
      throw Error(`feed_id: ${feed_id} doesn't exists`);
    }
    return feed_in_db;
  } catch (error) {
    throw error;
  }
};
