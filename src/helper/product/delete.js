import { is_authorized } from '../../../shared/security';
import { remove_from_db } from '../../../shared/mongodb';
import { send_SQS_message } from '../../../shared/sqs';
import { validate_feed_id } from '../validate';

// const SERVICE_ACTION = 'delete_feed';

export async function remove (logging_key, data, return_value) {
  try {
    console.log(`${logging_key} - started`);
    console.log(`${logging_key} - ${JSON.stringify(data)}`);

    // Authorization
    if (data.user_id) {
      // Supressed SERVICE_ACTION for Feed API's
      await is_authorized(logging_key, data);
    }

    const FEED = await validate_feed_id(logging_key, data.feed_id);

    const filter = {
      feed_id: data.feed_id
    };

    await remove_from_db(logging_key, process.env.TABLE_FEED, filter);

    if (FEED) {
      const message = {
        environment: process.env.ENVIRONMENT,
        object_id: FEED.feed_id,
        type: 'feed',
        action: 'delete'
      };
      await send_SQS_message(logging_key, process.env.SEARCH_Q, message);
    }

    return_value['data'] = FEED;
    console.log(`${logging_key} - finished - ${JSON.stringify(return_value)}`);
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
