/* eslint prefer-spread: "off", prefer-rest-params: "off" */

const supertest = require('supertest');

// This will create a virtual hostname that unit tests can leverage when needed
module.exports = (app, vhost) => {
  const real = supertest(app);
  const proxy = {};

  Object.keys(real).forEach((methodName) => {
    proxy[methodName] = function () {
      return real[methodName]
            .apply(real, arguments)
            .set('host', vhost);
    };
  });

  return proxy;
};
