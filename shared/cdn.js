import AWS from 'aws-sdk';
import _ from 'lodash';

function get_log(logging_key = '') {
    return (...messages) => console.log(`${logging_key} -`, ...messages);
}

const get_cdn_client = () => {
    if (process.env.NODE_ENV === 'production') {
        console.log('getting db resource using IAM');
        AWS.config.update({
            region: process.env.CDN_REGION
        });
    } else {
        console.log('getting db resource using config');
        AWS.config.loadFromPath('./mock/aws.dev.json');
    }
    return new AWS.CloudFront();
};

const cdn_client = get_cdn_client();

async function invalidate_cdn(logging_key, distribution_id = process.env.CDN_DISTRIBUTION_ID, object_paths = ['/*']) {
    const log = get_log(logging_key);
    log(`Invalidating ${distribution_id} - object_paths - ${object_paths}`);
    return cdn_client.createInvalidation({
        DistributionId: distribution_id,
        InvalidationBatch: {
            CallerReference: `cloudfront-invalite-distribution-${new Date().getTime()}`,
            Paths: {
                Items: object_paths,
                Quantity: object_paths.length
            }
        },
    }).promise();
}

module.exports = { invalidate_cdn };
