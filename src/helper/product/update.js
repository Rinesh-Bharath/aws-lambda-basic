import { kebabCase } from 'lodash';
import { update_into_db } from '../../../shared/mongodb';
import { is_authorized } from '../../../shared/security';
import { send_SQS_message } from '../../../shared/sqs';
import { validate_slug } from '../../../shared/slug';
import { validate_place_id, validate_feed_id } from '../validate';
import { validate_title, validate_content, validate_status } from './validate';

// const SERVICE_ACTION = 'update_feed';

export async function update (logging_key, data, return_value) {
  try {
    console.log(`${logging_key} - started - ${JSON.stringify(data)}`);

    // Authorization
    if (data.user_id) {
      // Supressed SERVICE_ACTION for Feed API's
      await is_authorized(logging_key, data);
    }

    const FEED = await validate_feed_id(logging_key, data.feed_id);

    let PLACE = {};

    if (FEED.object_type && FEED.object_type.toUpperCase() === 'PLACE') {
      PLACE = await validate_place_id(logging_key, FEED.object_id);
      data.object_type = FEED.object_type.toUpperCase();
    }

    if (data.title) {
      await validate_title(data.title, 'title');
      const slug_title = kebabCase(data.title);
      const temp_slug = `${slug_title}/${PLACE.slug}`;
      const slug_exist = await validate_slug(logging_key, 'PLACE_FEED', temp_slug);
      if (slug_exist) {
        let counter = 0;
        let slug_found = false;
        let current_slug = temp_slug;
        while (!slug_found) {
          current_slug = `${temp_slug}${counter === 0 ? '' : counter}`;
          console.log(`${logging_key} = current_slug ${current_slug}`);
          const slug_exist = await validate_slug(logging_key, 'PLACE_FEED', current_slug);
          if (!slug_exist) {
            data.slug = current_slug;
            slug_found = true;
          } else {
            slug_found = false;
          }
          counter += 1;
        }
      } else {
        data.slug = temp_slug;
      }
    }

    if (data.content) {
      await validate_content(data.content, 'content');
    }

    if (data.status) {
      await validate_status(data.status.toUpperCase(), 'status');
      data.status = data.status.toUpperCase();
    }

    data.audit = {
      created_by: FEED.audit.created_by,
      created_at: FEED.audit.created_at,
      updated_by: data.user_id,
      updated_at: new Date().toISOString()
    };

    // Skip cloned props
    const { user_id, user_data, feed_id, object_id, object_type, ...feedClone } = data;

    const filter = {
      feed_id: FEED.feed_id
    };

    const update = {
      $set: feedClone
    };

    let feed = await update_into_db(logging_key, process.env.TABLE_FEED, filter, update);
    feed = feed.value;

    if (feed) {
      const message = {
        environment: process.env.ENVIRONMENT,
        object_id: feed.feed_id,
        type: 'feed',
        action: 'update'
      };
      await send_SQS_message(logging_key, process.env.SEARCH_Q, message);
    }

    return_value['data'] = feed;
    console.log(`${logging_key} - started = ${JSON.stringify(return_value)}`);
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
