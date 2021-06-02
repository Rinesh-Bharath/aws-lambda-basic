import { includes } from 'lodash';

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
