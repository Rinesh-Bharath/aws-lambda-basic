import { fetch_one_from_db } from './mongodb';

const isRequired = (key) => {
  throw Error(`${key} value cannot be undefined for slug`);
};

export async function validate_slug (logging_key, type = isRequired('type'), slug = isRequired('slug')) {
  console.log(`${logging_key} - started slug validating`);
  try {
    const slugType = type.toUpperCase();
    console.log(`${logging_key} - slugType - ${JSON.stringify(slugType)}`);
    console.log(`${logging_key} - slugFilter - ${JSON.stringify(slug)}`);

    const filter = {
      slug
    };
    let collection = null;

    switch (slugType) {
    case 'USER':
      collection = process.env.TABLE_USER;
      break;

    case 'PLACE':
      collection = process.env.TABLE_PLACE;
      break;

    case 'PLACE_FEED':
      collection = process.env.TABLE_FEED;
      break;

    case 'MENU_DEAL':
      collection = process.env.TABLE_MENU_DEAL;
      break;

    case 'EVENT':
      collection = process.env.TABLE_EVENT;
      break;

    case 'ITEM':
      collection = process.env.TABLE_ITEM;
      break;

    case 'SERVICE_TYPE_SETTING':
      collection = process.env.TABLE_SERVICE_TYPE_SETTING;
      break;

    case 'MENU':
      collection = process.env.TABLE_MENU;
      break;
    }

    const slugExist = await fetch_one_from_db(logging_key, collection, filter);
    console.log(`${logging_key} - finished validating`);
    console.log(`${logging_key} - ${JSON.stringify(slugExist)}`);
    if (!slugExist) {
      return false;
    }
    return true;
  } catch (error) {
    throw error;
  }
};
