import * as product from './helper/product';
import * as search from './helper/search';

exports.process_data = async (data, logging_key) => {
  const return_value = {
    service: 'api-product'
  };
  console.log(`${logging_key} = process_data - data = ${JSON.stringify(data)}`);
  const payload = data.body.input;
  try {
    const logging_key_local = logging_key + ' - ' + data.action;

    switch (data.action) {
    case 'create_product': {
      console.log(logging_key_local + ' = process_data - started');
      await product.create(logging_key_local, payload, return_value);
      console.log(logging_key_local + ' = process_data - finished');
      break;
    }
    case 'read_product': {
      console.log(logging_key_local + ' = process_data - started');
      await product.read(logging_key_local, payload, return_value);
      console.log(logging_key_local + ' = process_data - finished');
      break;
    }
    case 'update_product': {
      console.log(logging_key_local + ' = process_data - started');
      await product.update(logging_key_local, payload, return_value);
      console.log(logging_key_local + ' = process_data - finished');
      break;
    }
    case 'delete_product': {
      console.log(logging_key_local + ' = process_data - started');
      await product.remove(logging_key_local, payload, return_value);
      console.log(logging_key_local + ' = process_data - finished');
      break;
    }
    case 'search_products': {
      console.log(logging_key_local + ' = process_data - started');
      await search.place_feed(logging_key_local, payload, return_value);
      console.log(logging_key_local + ' = process_data - finished');
      break;
    }
    }
    console.log(logging_key_local + ' = process_data - return_value = ' + JSON.stringify(return_value));
    return return_value;
  } catch (error) {
    throw error;
  }
};
