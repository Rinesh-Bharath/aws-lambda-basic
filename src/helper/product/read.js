import { fetch_one_from_db } from '../../../shared/mongodb';

export async function read (logging_key, filter, return_value) {
  try {
    console.log(`${logging_key} - started - ${JSON.stringify(filter)}`);
    const FEED = await fetch_one_from_db(logging_key, process.env.TABLE_FEED, filter);
    if (!FEED) {
      throw Error('FEED does not exists');
    }
    return_value['data'] = FEED;
    console.log(`${logging_key} - finished - ${JSON.stringify(return_value)}`);
    return return_value;
  } catch (error) {
    return_value['data'] = {
      error: [{
        code: '301',
        description: error.message
      }]
    };
    return return_value;
  }
}
