'use strict';

const Validator = require('jsonschema').Validator;

// Init default options
const defaults = {
  forceProtocol: 'none',
  forceWww: 'www',
  forceTrailingSlash: 'trim',
  forceCase: 'lower',
  forceCaseQuery: 'none',
  redirectType: '301',
  excludedPaths: [],
};

// Define Options schema for validation
const optionsSchema = {
  id: '/Options',
  type: 'object:',
  properties: {
    forceProtocol: {
      enum: ['http', 'https', 'none'],
    },
    forceWww: {
      enum: ['www', 'no-www', 'none'],
    },
    forceTrailingSlash: {
      enum: ['trim', 'keep', 'none'],
    },
    forceCase: {
      enum: ['lower', 'upper', 'none'],
    },
    forceCaseQuery: {
      enum: ['lower', 'upper', 'none'],
    },
    redirectType: {
      enum: ['301', '302'],
    },
    excludedPaths: {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
  },
};

// Add options schema to validator
const validator = new Validator();
validator.addSchema(optionsSchema, '/Options');

function setupOptions(options) {
  const opts = options;

  // Check to see if each option has been configured, if not use default
  opts.forceProtocol = (opts.forceProtocol === undefined ?
    defaults.forceProtocol : opts.forceProtocol);
  opts.forceWww = (opts.forceWww === undefined ?
    defaults.forceWww : opts.forceWww);
  opts.forceTrailingSlash = (opts.forceTrailingSlash === undefined ?
    defaults.forceTrailingSlash : opts.forceTrailingSlash);
  opts.forceCase = (opts.forceCase === undefined ?
    defaults.forceCase : opts.forceCase);
  opts.forceCaseQuery = (opts.forceCaseQuery === undefined ?
    defaults.forceCaseQuery : opts.forceCaseQuery);
  opts.redirectType = (opts.redirectType === undefined ?
    defaults.redirectType : opts.redirectType);
  opts.excludedPaths = (opts.excludedPaths === undefined ?
    defaults.excludedPaths : opts.excludedPaths);

  // Validate options against schema
  validator.validate(opts, optionsSchema, { throwError: true });

  return opts;
}

// Middleware export
module.exports = options => {
  // Setup Options: if undefined, use defaults, otherwise pass to option handler
  const opts = (options === undefined ? defaults : setupOptions(options));

  /* eslint consistent-return: "off" */

  // Process Request and Redirect
  return (req, res, next) => {
    // Break down request URL into components
    let urlProtocol = req.protocol;
    let urlHost = req.headers.host;
    let urlPath = req.originalUrl.split('?')[0];
    const queryString = req.originalUrl.split('?')[1];
    let urlQueryString = (queryString === undefined ? '' : `?${queryString}`);
    let redirectRequired = false;
    const statusCode = parseInt(opts.redirectType, 10);

    // Check to see if path should be excluded from normalization
    for (const path of opts.excludedPaths) {
      const pattern = new RegExp(path);
      if (pattern.test(urlPath)) {
        return next();
      }
    }

    // Force HTTP or HTTPS
    if (opts.forceProtocol === 'http') {
      if (urlProtocol !== 'http') {
        redirectRequired = true;
        urlProtocol = 'http';
      }
    } else if (opts.forceProtocol === 'https') {
      if (urlProtocol !== 'https') {
        redirectRequired = true;
        urlProtocol = 'https';
      }
    }

    // Force WWW or Remove WWW
    if (opts.forceWww === 'www') {
      const testHost = urlHost.toLowerCase(); // Let's force lower case to make sure we match.
      if (testHost.indexOf('www.') === -1) {
        redirectRequired = true;
        urlHost = `www.${urlHost}`;
      }
    } else if (opts.forceWww === 'no-www') {
      const testHost = urlHost.toLowerCase(); // Let's force lower case to make sure we match.
      if (testHost.indexOf('www.') === 0) {
        redirectRequired = true;
        urlHost = urlHost.slice('www.'.length);
      }
    }

    // Force Trailing Slash Removal
    if (opts.forceTrailingSlash === 'trim') {
      if (urlPath.substr(-1) === '/' && urlPath.length > 1) {
        redirectRequired = true;
        urlPath = urlPath.slice(0, -1);
      }
    }

    // Force Trailing Slash Keep
    if (opts.forceTrailingSlash === 'keep') {
      if (urlPath.substr(-1) !== '/' && !/\w+\.([A-Za-z0-9]{3,4})(?=\?|$)/.test(urlPath)) {
        redirectRequired = true;
        urlPath += '/';
      }
    }

    // Force Lowercase or Uppercase
    if (opts.forceCase === 'lower') {
      if (/[A-Z]/.test(urlProtocol) || /[A-Z]/.test(urlHost) || /[A-Z]/.test(urlPath)) {
        redirectRequired = true;
        urlProtocol = urlProtocol.toLowerCase();
        urlHost = urlHost.toLowerCase();
        urlPath = urlPath.toLowerCase();
      }
    } else if (opts.forceCase === 'upper') {
      if (/[a-z]/.test(urlProtocol) || /[a-z]/.test(urlHost) || /[a-z]/.test(urlPath)) {
        redirectRequired = true;
        urlProtocol = urlProtocol.toUpperCase();
        urlHost = urlHost.toUpperCase();
        urlPath = urlPath.toUpperCase();
      }
    }

    // Force Lowercase or Uppercase Query String
    if (opts.forceCaseQuery === 'lower') {
      if (/[A-Z]/.test(urlQueryString)) {
        redirectRequired = true;
        urlQueryString = urlQueryString.toLowerCase();
      }
    } else if (opts.forceCaseQuery === 'upper') {
      if (/[a-z]/.test(urlQueryString)) {
        redirectRequired = true;
        urlQueryString = urlQueryString.toUpperCase();
      }
    }

    // Compile URL and redirect if needed, otherwise next middleware
    if (redirectRequired) {
      const compiledUrl = `${urlProtocol}://${urlHost}${urlPath}${urlQueryString}`;
      res.redirect(statusCode, compiledUrl);
    } else {
      return next();
    }
  };
};
