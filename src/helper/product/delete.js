import { remove_from_db } from '../../../shared/mongodb';
import { validate_product_id_exists } from './validate';

// const SERVICE_ACTION = 'delete_feed';

export async function remove (logging_key, data, return_value) {
  try {
    console.log(`${logging_key} - started`);
    const PRODUCT = await validate_product_id_exists(logging_key, data.product_id);
    await remove_from_db(logging_key, process.env.TABLE_PRODUCT, data);
    console.log(`${logging_key} - Product Deleted - ${JSON.stringify(PRODUCT)}`);
    return_value['data'] = PRODUCT;
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
