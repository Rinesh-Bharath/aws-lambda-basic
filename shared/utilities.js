exports.wait = delay_ms => {
  return new Promise(resolve => {
    setTimeout(resolve, delay_ms);
  });
};

exports.is_prod = () => {
  return process.env.ENVIRONMENT && process.env.ENVIRONMENT === 'PROD';
};

exports.is_prod_like = () => {
  return process.env.ENVIRONMENT && process.env.ENVIRONMENT === 'UAT1';
};

exports.is_test_flight = () => {
  return process.env.ENVIRONMENT && process.env.ENVIRONMENT === 'UAT2';
};
