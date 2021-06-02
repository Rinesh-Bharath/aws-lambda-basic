import { isEmpty, indexOf, uniq } from 'lodash';
import { post_to_search } from './search';
import { fetch_one_from_db } from './mongodb';
import { AuthorizationError, ValidationError } from './custom_error';

export async function is_authorized (logging_key, data = {}, service_action = null) {
  const logging_key_local = `${logging_key} - is_authorized`;
  console.log(`${logging_key_local} - data - ${JSON.stringify(data)}`);
  console.log(`${logging_key_local} - started for service_action - ${service_action}`);
  try {
    if (!data.user_id) {
      throw new ValidationError(`Required field: user_id`, '701');
    }
    const filter = {
      user_id: data.user_id
    };
    const USER = await fetch_one_from_db(logging_key, process.env.TABLE_USER, filter);
    if (!USER) {
      throw new AuthorizationError(`Invalid user_id: ${data.user_id}`, '601');
    }
    data.user_data = USER;

    // Access control checks
    if (service_action) {
      // Bypassing authorisation check for app users - critical Bypassing operation
      if (!data.user_data.role && isEmpty(data.user_data.role)) {
        return true;
      }
      await access_control(logging_key, data.user_data.role, service_action);
    }
  } catch (error) {
    throw error;
  }
};

async function access_control (logging_key, role = null, service_action = null) {
  const logging_key_local = `${logging_key} - access_control`;
  console.log(`${logging_key_local} - role - ${role}`);
  try {
    console.log(`${logging_key_local} - started - fetching from es - roles ${role}`);
    const filter = {
      'query': {
        'bool': {
          'filter': {
            'terms': {
              'name': role
            }
          }
        }
      }
    };
    console.log(`${logging_key_local} - filter - ${JSON.stringify(filter)}`);
    const ES_RESPONSE = await post_to_search(`${logging_key_local}`, `/securities/_search`, filter);
    console.log(`${logging_key_local} - finished - fetching from es - ES_RESPONSE ${JSON.stringify(ES_RESPONSE)}`);

    if (!ES_RESPONSE || !ES_RESPONSE.hits || (isEmpty(ES_RESPONSE.hits.hits))) {
      throw new AuthorizationError(`Role information not found: ${role}`, '602');
    }

    const API_ACTIONS = await process_api_actions(logging_key, ES_RESPONSE.hits.hits);
    console.log(`${logging_key} - API_ACTIONS - ${JSON.stringify(API_ACTIONS)}`);
    const actionIndex = indexOf(API_ACTIONS, service_action);
    if (actionIndex === -1) {
      throw new AuthorizationError(`Access to this service restricted for the user`, '605');
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function process_api_actions (logging_key, es_hits = []) {
  try {
    const es_hit_sources = [];
    for (const es_hit of es_hits) {
      es_hit_sources.push(es_hit._source);
    }
    if (isEmpty(es_hit_sources)) {
      throw new AuthorizationError(`Source docs is empty`, '603');
    }

    const es_api_actions = [];
    for (const es_hit_source of es_hit_sources) {
      const api_actions = es_hit_source.api_action || [];
      for (const api_action of api_actions) {
        es_api_actions.push(api_action);
      }
    }
    if (isEmpty(es_api_actions)) {
      throw new AuthorizationError(`Api Actions is empty`, '604');
    }
    return uniq(es_api_actions);
  } catch (error) {
    throw error;
  }
}

export async function is_authorised (logging_key, user_id, action) {
  try {
    console.log(logging_key + ' = is_authorised - validating - user_id = ' + user_id + ' action = ' + action);
    if (!user_id) {
      return false;
    }
    if (!action) {
      return false;
    }
    // TODO validate actions here for the user with the authorisation model against authorise service
    console.log(logging_key + ' = is_authorised - validating - user_id = ' + user_id + ' action = ' + action);
    return true;
  } catch (error) {
    console.log(logging_key + ' = is_authorised - failed - user_id = ' + user_id + ' action = ' + action);
    console.log(error, error.stack);
    return false;
  }
};
