import { v4 as uuid4 } from 'uuid';
import { kebabCase } from 'lodash';
import { insert_into_db } from '../../../shared/mongodb';
import { is_authorized } from '../../../shared/security';
import { send_SQS_message } from '../../../shared/sqs';
import { validate_place_id, validate_feed_id_exist } from '../validate';
import { validate_title, validate_content, validate_status } from './validate';

// const SERVICE_ACTION = 'create_feed';

export async function create (logging_key, data, return_value) {
  try {
    console.log(`${logging_key} - started`);
    console.log(`${logging_key} - ${JSON.stringify(data)}`);

    // Authorization
    if (data.user_id) {
      // Supressed SERVICE_ACTION for Feed API's
      await is_authorized(logging_key, data);
    }

    if (!data.feed_id) {
      data.feed_id = uuid4();
    } else {
      await validate_feed_id_exist(logging_key, data.feed_id);
    }

    if (!data.object_type) {
      throw Error(`object_type is a required field`);
    }

    if (!data.object_id) {
      throw Error(`object_id is a required field`);
    }

    let PLACE = {};

    if (data.object_type.toUpperCase() === 'PLACE') {
      PLACE = await validate_place_id(logging_key, data.object_id);
      data.object_type = data.object_type.toUpperCase();
    }

    if (data.title) {
      await validate_title(data.title, 'title');
      const slug_title = kebabCase(data.title);
      const slug_place = kebabCase(PLACE.name);
      data.slug = `${slug_title}-${slug_place}`;
    }

    if (data.content) {
      await validate_content(data.content, 'content');
    }

    if (data.status) {
      await validate_status(data.status.toUpperCase(), 'status');
      data.status = data.status.toUpperCase();
    } else {
      data.status = 'ACTIVE';
    }

    data.audit = {
      created_by: data.user_id,
      created_at: new Date().toISOString(),
      updated_by: data.user_id,
      updated_at: new Date().toISOString()
    };

    // Skip cloned props
    const { user_id, user_data, ...feedClone } = data;

    const FEED = await insert_into_db(logging_key, process.env.TABLE_FEED, feedClone);
    if (FEED) {
      const message = {
        environment: process.env.ENVIRONMENT,
        object_id: FEED.feed_id,
        type: 'feed',
        action: 'create'
      };
      await send_SQS_message(logging_key, process.env.SEARCH_Q, message);
    }

    return_value['data'] = FEED;
    console.log(`${logging_key} - finished = ${JSON.stringify(return_value)}`);
    return return_value;
  } catch (error) {
    return_value['data'] = {
      error: [{
        code: error.statusCode,
        type: error.name,
        description: error.message
      }]
    };
    return return_value;
  }
}
