// #region # Local Environment Setup#

exports.set_local_environment = (logging_key, environment = 'DEV1') => {
  if (process.env.NODE_ENV !== 'production' && process.env.ENVIRONMENT !== 'PROD') {
    environment = environment.toUpperCase();
    console.log(logging_key + ' = setting environment variables for local run');
    process.env.NODE_ENV = 'development';
    process.env.ENVIRONMENT = environment;
    process.env.AWS_REGION = 'us-east-1';
    process.env.DB_REGION = 'us-east-1';
    process.env.SNS_REGION = 'us-east-1';
    process.env.EMAIL_REGION = 'us-east-1';
    process.env.SQS_REGION = 'us-east-1';
    process.env.S3_REGION = 'us-east-1';
    process.env.SEARCH_REGION = 'us-east-1';

    let environment_dns_sub_domain = 'test';
    if (environment === 'DEV1') {
      process.env.SQS_BASE_URL = 'https://sqs.us-east-1.amazonaws.com/881350358275/';
      environment_dns_sub_domain = 'dev';
      process.env.ORGANISATION_NAME = 'ki-dev';
    } else {
      process.env.SQS_BASE_URL = 'https://sqs.us-east-1.amazonaws.com/652627192073/';
      environment_dns_sub_domain = 'test';
      process.env.ORGANISATION_NAME = 'ki-test';
    }

    process.env.ELASTICSEARCH_INDEX = `kravein_${environment.toLowerCase()}`;
    process.env.ACTIVITY_Q = `activity_Q`;
    process.env.NOTIFY_Q = `notify_Q`;
    process.env.CACHE_Q = `cache_Q`;
    process.env.ANALYTIC_Q = `analytic_Q`;
    process.env.SEARCH_Q = `search_Q`;
    process.env.REWARD_Q = `reward_Q`;
    process.env.TRANSACTIONAL_FROM_EMAIL = 'dev-support@kravein.com.au';
    process.env.TRANSACTIONAL_EMAIL_API_KEY = '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';
    process.env.TRANSACTIONAL_EMAIL_CLIENT_KEY = 'sendgrid_email';
    process.env.BRANCH_IO_KEY = 'branch.io';

    process.env.TABLE_ACCESS_ROLE = `access_role_${environment}`;
    process.env.TABLE_CLAIMANT = `claimant_${environment}`;
    process.env.TABLE_COMMENT = `comment_${environment}`;
    process.env.TABLE_COMPANY = `company_${environment}`;
    process.env.TABLE_CUSTOM_HOUR = `custom_hour_${environment}`;
    process.env.TABLE_EVENT = `event_${environment}`;
    process.env.TABLE_EVENT_BOOKING = `event_booking_${environment}`;
    process.env.TABLE_EVENT_OCCURRENCE = `event_occurrence_${environment}`;
    process.env.TABLE_FEED = `feed_${environment}`;
    process.env.TABLE_FLAG = `flag_${environment}`;
    process.env.TABLE_FOLLOW = `follow_${environment}`;
    process.env.TABLE_IMAGE = `image_${environment}`;
    process.env.TABLE_IMAGE_REVIEW = `image_review_${environment}`;
    process.env.TABLE_ITEM = `item_${environment}`;
    process.env.TABLE_ITEM_DICTIONARY = `item_dictionary_${environment}`;
    process.env.TABLE_ITEM_LINK = `item_link_${environment}`;
    process.env.TABLE_ITEM_REVIEW = `item_review_${environment}`;
    process.env.TABLE_MENU = `menu_${environment}`;
    process.env.TABLE_MENU_ITEM = `menu_item_${environment}`;
    process.env.TABLE_MENU_MODIFIER = `menu_modifier_${environment}`;
    process.env.TABLE_MENU_MODIFIER_GROUP = `menu_modifier_group_${environment}`;
    process.env.TABLE_MENU_ORDER = `menu_order_${environment}`;
    process.env.TABLE_MENU_SECTION = `menu_section_${environment}`;
    process.env.TABLE_MENU_TYPE = `menu_type_${environment}`;
    process.env.TABLE_MENU_TYPE_GLOBAL = `menu_type_global_${environment}`;
    process.env.TABLE_MENU_DEAL = `menu_deal_${environment}`;
    process.env.TABLE_PLACE = `place_${environment}`;
    process.env.TABLE_PLACE_EVENT_VOUCHER = `place_event_voucher_${environment}`;
    process.env.TABLE_PLACE_REVIEW = `place_review_${environment}`;
    process.env.TABLE_SOCIAL = `social_${environment}`;
    process.env.TABLE_SERVICE_TYPE = `service_type_${environment}`;
    process.env.TABLE_SERVICE_TYPE_SETTING = `service_type_setting_${environment}`;
    process.env.TABLE_TICKET = `ticket_${environment}`;
    process.env.TABLE_TICKET_RECORD = `ticket_record_${environment}`;
    process.env.TABLE_USER = `user_${environment}`;

    process.env.TABLE_ERROR = `error`;
    process.env.TABLE_PROPERTIES = `properties`;
    process.env.TABLE_ACTIVITY_LOG = `activity_log`;

    process.env.KI_DOMAIN_NAME = 'www.kravein.com.au';
    process.env.EMAIL_SOURCE = 'support@kravein.com.au';
    process.env.EMAIL_REPLY_TO_ADDRESS = 'support@kravein.com.au';

    process.env.CONTEXT_ROOT = 'test';
    process.env.PORT = '5000';
    process.env.MOMENT_TIMEZONE = 'America/Los_Angeles';

    process.env.CACHE_HOST = `${environment.toLowerCase()}.cache.kravein.com.au`;
    process.env.CACHE_HOST = `3.223.23.238`;
    process.env.CACHE_PORT = 6379;
    process.env.CACHE_TTL_IN_MILLISECONDS = 300000;
    process.env.ADMIN_CDN_DISTRIBUTION_ID = 'EE394YOP5RSQO';
    process.env.WEB_CDN_DISTRIBUTION_ID = 'E2UQN89FOC030S';

    process.env.CMS_API_CLIENT_ID = 'batchprocess';
    process.env.CMS_API_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE1OTQ1NTQ4MDAsImF1ZCI6WyJodHRwczovL2FwaS11cy1lYXN0LTEuZ3JhcGhjbXMuY29tL3YyL2NrY2c0MHI5ZjE1NGUwMXh0ZTk1bDZ3ZmsvbWFzdGVyIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiNGZmNTA3NTctMjc2ZC00M2I4LWI3Y2ItZTc4YzM2MTJkZTVjIiwianRpIjoiY2tjajByYTU0MHo3ZDAxejhmcm1iOGcyeCJ9.Tb4N6Anf2XDIXI4t2bb7dXcKlHK38Su0IcyS3u1rzTEkGWLRV-5qmPHqSut3G5kecbuDVCSail7aUQPbl-c4RomAwCy3lYA75SVxHy-XYmG_Iha9mv29NUleCHBmwBoA7IgEZkFpZWMb-oXFqXbv9tkf1N6vBS4KYRbxYDagtJZsrwaiqkQttSspPChtx7-cHffHzNwuS1NnQfnJ0AqMsQd1dmpa6MuuWNmHlr013G2bYtZUs7jZxBset50ScJqp6xZS42Bl0Lx85q_CcIMWIlnMUZjaoOc6tbIoqVKtb8V05q08tW5-JXUFXVmWKbrfIDtmoH3jl0VJIvsZdX5NkkTAQp4sohMvfp2rR25_efHmaSpmNRtV6bYxrhPcS1QpSutBG5F_eKKRfMrIrhblMpvsl6znQQdT_nZpwPRLr81YL5heUpRfogVlyPDBr8L9FBrEEPpM4HQKdxECvU0Zcwe3tlc9_JlF3ljfWB9_ivZrZSzt1PupY6AdvUWCgSepw86bZJF5Cz2tu7goQ_0WdDdIFqoYMJDbozW9o1BNcmegMza1OPdxESdXpI2vk-9O5jPw-6CYegcFVfCwZww05-J481dWH0Jznwx3pAcs03zxkB0l6lcSRXJusLi1KyprezSLAmTM85Dy2zqYFQA4jITaHrZWBSONAZP3PZNLyBc';
    process.env.CMS_API_ENDPOINT = 'https://api-us-east-1.graphcms.com/v2/ckcg40r9f154e01xte95l6wfk/master';

    process.env.MONGO_DB_URI = `mongodb+srv://test1:kravein@test-4hkqa.mongodb.net/${environment.toLowerCase()}?retryWrites=true`;
    process.env.CONTENT_S3_BUCKET_NAME = `${environment.toLowerCase()}.content.kravein.com.au`;
    process.env.STATIC_S3_BUCKET_NAME = `${environment.toLowerCase()}.static.kravein.com.au`;
    process.env.IMAGE_S3_BUCKET_NAME = `${environment.toLowerCase()}.images.kravein.com.au`;

    process.env.SEARCH_SECURED = false;

    switch (process.env.ENVIRONMENT) {
      case 'DEV1':
        process.env.CUSTOM = `custom_${process.env.ENVIRONMENT}`;
        process.env.COGNITO_USER_POOL_ID = 'us-east-1_9Xkdly93x';
        process.env.COGNITO_APP_CLIENT_ID = '3p8hpefpgqd2vri5jpkg7pceu1';
        process.env.COGNITO_IDENTITY_POOL_ID = 'us-east-1:c8290d25-a498-49cf-a5a7-b08100615c9b';
        process.env.ELASTICSEARCH_DOMAIN = 'https://search-stackse-elasti-4h4cz7ywgx80-kcv6pdoqdjmird7ve5m6j6xady.us-east-1.es.amazonaws.com';
        process.env.NOTIFICATION_ARN = 'arn:aws:sns:us-east-1:652627192073:TOOLS-TestTopic-L7CV2Z5WZOJ2';
        process.env.SEARCH_NOTIFICATION_ARN = 'arn:aws:sns:us-east-1:881350358275:infrastructure-sns-SearchTopic-1HSBWSEC6M0E8';
        process.env.KI_API_VOUCHER_LAMBDA = 'ki-api-voucher-DEV1-lambdafunction-3OL2822NLTJH'
        process.env.ELASTIC_SEARCH_SERVICE_ARN = 'arn:aws:lambda:us-east-1:881350358275:function:ki-elasticsearch-service-DEV1-lambdafunction-3MXGA8HLFBT';
        process.env.LOAD_LOCATION_ARN = 'arn:aws:lambda:us-east-1:881350358275:function:ki-load-location-DEV1-lambdafunction-1V03RHZGE83UW';
        process.env.LOAD_CMS_DATA_ARN = 'arn:aws:lambda:us-east-1:881350358275:function:ki-load-cms-data-DEV1-lambdafunction-1VQCDGJ32VVF8';
        process.env.LOAD_DATA_ARN = 'arn:aws:lambda:us-east-1:881350358275:function:ki-load-data-DEV1-lambdafunction-14BFREBJ98AQV';
        process.env.SYNC_SERVICE_ARN = 'arn:aws:lambda:us-east-1:881350358275:function:ki-sync-service-DEV1-lambdafunction-1X4HS8YYHGW6S';
        process.env.SEARCH_NOTIFICATION_ARN = 'arn:aws:sns:us-east-1:881350358275:StackSet-SNS-1696a1d1-2b2f-4308-a8c1-1bc8587cd64f-SearchTopic-XINAGA31OTLB';
        break;
      case 'TEST':
        process.env.CUSTOM = `custom_${process.env.ENVIRONMENT}`;
        process.env.COGNITO_USER_POOL_ID = 'us-east-1_JvKtjTImD';
        process.env.COGNITO_APP_CLIENT_ID = '32gr3s5n85rfbi10top0dtv9fc';
        process.env.COGNITO_IDENTITY_POOL_ID = 'us-east-1:a3176c3e-c65d-447a-83fd-fe9a94accb85';
        process.env.ELASTICSEARCH_DOMAIN = 'https://search-stackse-elasti-g7bff90gmdhn-uxabiifphvmypoylle3o76piga.us-east-1.es.amazonaws.com';
        process.env.NOTIFICATION_ARN = 'arn:aws:sns:us-east-1:652627192073:TOOLS-TestTopic-L7CV2Z5WZOJ2';
        process.env.SEARCH_NOTIFICATION_ARN = 'arn:aws:sns:us-east-1:561048465573:StackSet-SNS-fd483c7c-f9a6-48bc-911a-3337c38e6594-SearchTopic-UTFP5NJ0QEMH';
        process.env.KI_API_VOUCHER_LAMBDA = 'ki-api-voucher-DEV1-lambdafunction-3OL2822NLTJH'
        process.env.ELASTIC_SEARCH_SERVICE_ARN = 'arn:aws:lambda:us-east-1:561048465573:function:ki-elasticsearch-service-TEST-lambdafunction-MIJZG5QCWH6J';
        process.env.LOAD_LOCATION_ARN = 'arn:aws:lambda:us-east-1:561048465573:function:ki-load-location-TEST-lambdafunction-1UJR2XM8H03MM';
        process.env.LOAD_CMS_DATA_ARN = 'arn:aws:lambda:us-east-1:561048465573:function:ki-load-cms-data-TEST-lambdafunction-1UTSJR9KJM7UU';
        process.env.LOAD_DATA_ARN = 'arn:aws:lambda:us-east-1:561048465573:function:ki-load-data-TEST-lambdafunction-13YRSVNUIX84T';
        process.env.SYNC_SERVICE_ARN = 'arn:aws:lambda:us-east-1:561048465573:function:ki-sync-service-TEST-lambdafunction-MFVVUJYNQUQ0';
        process.env.SEARCH_NOTIFICATION_ARN = 'arn:aws:sns:us-east-1:561048465573:StackSet-SNS-fd483c7c-f9a6-48bc-911a-3337c38e6594-SearchTopic-UTFP5NJ0QEMH';
        break;
    }
  }
};

// #endregion
