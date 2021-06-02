import { aggregate_from_db } from '../../../shared/mongodb';

export async function products (logging_key, data, return_value) {
  try {
    console.log(`${logging_key} - started`);
    console.log(`${logging_key} - ${JSON.stringify(data)}`);

    const query = [
      {
        '$match': {
          'object_type': 'place'
        }
      },
      {
        '$lookup': {
          'from': process.env.TABLE_PLACE,
          'localField': 'object_id',
          'foreignField': 'place_id',
          'as': 'place'
        }
      },
      {
        '$unwind': {
          'path': '$place'
        }
      },
      {
        '$project': {
          'place_id': '$object_id',
          'feed_id': 1,
          'name': '$place.name',
          'city': '$place.city',
          'title': 1,
          'slug': 1,
          'content': 1,
          'status': 1,
          'social': 1,
          'audit': 1
        }
      }
    ];

    if (data.location) {
      const stage = {
        '$match': {
          'city': {
            $regex: new RegExp(data.location, 'i')
          }
        }
      };
      query.push(stage);
    }

    if (data.filter.place_feed_filter) {
      if (data.filter.place_feed_filter.place_id) {
        const stage = {
          '$match': {
            'place_id': {
              $in: data.filter.place_feed_filter.place_id
            }
          }
        };
        query.push(stage);
      }

      if (data.filter.place_feed_filter.place_name) {
        const stage = {
          '$match': {
            'name': {
              $regex: new RegExp(data.filter.place_feed_filter.place_name, 'i')
            }
          }
        };
        query.push(stage);
      }

      if (data.filter.place_feed_filter.status) {
        const stage = {
          '$match': {
            'status': data.filter.place_feed_filter.status
          }
        };
        query.push(stage);
      }

      if (data.filter.place_feed_filter.slug) {
        const stage = {
          '$match': {
            'slug': data.filter.place_feed_filter.slug
          }
        };
        query.push(stage);
      }
    }

    const facet_data_query = [ { $skip: data.from ? data.from : 0 } ];
    if (data.size) {
      facet_data_query.push({ $limit: data.size });
    }
    if (data.sort) {
      let sort = {};
      switch (data.sort) {
      case 'PLACE_NAME_ASC':
        sort = {
          'name': 1
        };
        break;

      case 'PLACE_NAME_DESC':
        sort = {
          'name': -1
        };
        break;

      case 'PLACE_CITY_ASC':
        sort = {
          'city': 1
        };
        break;

      case 'PLACE_CITY_DESC':
        sort = {
          'city': -1
        };
        break;

      case 'TITLE_ASC':
        sort = {
          'title': 1
        };
        break;

      case 'TITLE_DESC':
        sort = {
          'title': -1
        };
        break;

      case 'CREATED_ASC':
        sort = {
          'audit.created_at': 1
        };
        break;

      case 'CREATED_DESC':
        sort = {
          'audit.created_at': -1
        };
        break;

      case 'UPDATED_ASC':
        sort = {
          'audit.updated_at': 1
        };
        break;

      case 'UPDATED_DESC':
        sort = {
          'audit.updated_at': -1
        };
        break;

      default:
        sort = {
          'audit.updated_at': -1
        };
      }

      const stage = {
        '$sort': sort
      };
      facet_data_query.push(stage);
    }

    const facet = {
      '$facet': {
        metadata: [ { $count: 'total' } ],
        data: facet_data_query
      }
    };
    query.push(facet);

    const aggregate_resp = await aggregate_from_db(logging_key, process.env.TABLE_FEED, query);
    console.log(`${logging_key} - aggregate_resp - ${JSON.stringify(aggregate_resp)}`);
    if (aggregate_resp && aggregate_resp.length > 0) {
      const aggregate_resp_entry = aggregate_resp[0];
      const total_size = aggregate_resp_entry.metadata.length > 0 ? aggregate_resp_entry.metadata[0].total : 0;
      let total_pages = 1;
      if (data.size) {
        total_pages = Math.floor(total_size / data.size) + (total_size % data.size ? 1 : 0);
      }
      const place_feed_resp = {
        total_pages: total_pages,
        total_size: total_size,
        place_feed_listing: aggregate_resp_entry.data
      };
      return_value['data'] = place_feed_resp;
    } else {
      return_value['data'] = {
        total_pages: 1,
        place_feed_listing: []
      };
    }
    console.log(`${logging_key} - finished - ${JSON.stringify(return_value)}`);
    return return_value;
  } catch (error) {
    console.log(error, error.stack);
    return error;
  }
}
