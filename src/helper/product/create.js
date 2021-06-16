import pkg from 'lodash';
import { v4 as uuid } from 'uuid';
import { insert_into_db } from '../../../shared/mongodb';

const { isEmpty } = pkg;

export async function create (logging_key, data, return_value) {
  try {
    console.log(`${logging_key} - started`);
    console.log(`${logging_key} - ${JSON.stringify(data)}`);
    const PRODUCT_LIST = data || [];
    if (isEmpty(PRODUCT_LIST)) {
      throw new Error('PRODUCT_LIST cannot be empty');
    }
    const PRODUCTS = await Promise.all(PRODUCT_LIST.map(
      async (product) => create_product(logging_key, product)
    ));
    return_value['data'] = PRODUCTS;
    console.log(`${logging_key} - Products Added - ${JSON.stringify(return_value)}`);
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
};

async function create_product (logging_key, product = {}) {
  try {
    const productData = {
      product_id: uuid()
    };

    // default status: 'INACTIVE'
    productData.status = 'INACTIVE';
    productData.name = product.name;
    productData.price = product.price || 'NA';
    productData.color = product.color || 'NA';
    productData.audit = {
      created_by: product.user_id || null,
      created_at: new Date().toISOString(),
      updated_by: product.user_id || null,
      updated_at: new Date().toISOString(),
    };
    const productInserted = await insert_into_db(logging_key, process.env.TABLE_PRODUCT, productData);
    return productInserted;
  } catch (error) {
    throw error;
  }
};
