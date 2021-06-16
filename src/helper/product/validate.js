import { includes } from 'lodash';
import { fetch_one_from_db } from '../../../shared/mongodb.js';

export async function validate_title (object, object_key) {
  if (object.length < 3 || object.length > 50) {
    throw Error(`${object_key} should be greater than 3 characters and less than 50 characters`);
  }
  return true;
}

export async function validate_content (object, object_key) {
  if (object.length < 20 || object.length > 1200) {
    throw Error(`${object_key} should be greater than 20 characters and less than 1200 characters`);
  }
  return true;
}

export async function validate_status (object, object_key) {
  const status = ['ACTIVE', 'INACTIVE'];
  if (!includes(status, object)) {
    throw Error(`${object_key} should be either of these values - ${status}`);
  }
  return true;
}

export async function validate_product_id_exists (logging_key, product_id) {
  try {
    const filter = {
      product_id
    };
    const PRODUCT = await fetch_one_from_db(logging_key, process.env.TABLE_PRODUCT, filter);
    if (!PRODUCT) {
      throw new Error('ProductID does not exists');
    }
    return PRODUCT;
  } catch (err) {
    throw err;
  }
};
