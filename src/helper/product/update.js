import { update_into_db } from '../../../shared/mongodb';
import { validate_product_id_exists } from './validate';

export async function update (logging_key, data, return_value) {
  try {
    console.log(`${logging_key} - started - ${JSON.stringify(data)}`);
    await validate_product_id_exists(logging_key, data.product_id);

    const updateData = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.color) {
      updateData.color = data.color;
    }

    if (data.price) {
      updateData.price = data.price;
    }

    const filter = {
      product_id: data.product_id
    };
    const update = {
      $set: updateData
    };

    const PRODUCT = await update_into_db(logging_key, process.env.TABLE_PRODUCT, filter, update);
    console.log(`${logging_key} - Product Detail - ${JSON.stringify(PRODUCT)}`);
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
