const assert = require('chai').assert;
const request = require('supertest');
const express = require('express');
const normy = require('./');

// This will create a virtual hostname that unit tests can leverage when needed
function createVhostTester(app, vhost) {
  const real = request(app);
  const proxy = {};

  Object.keys(real).forEach((methodName) => {
    proxy[methodName] = function () {
      return real[methodName]
            .apply(real, arguments)
            .set('host', vhost);
    };
  });

  return proxy;
}

describe('Force Protocol', () => {
  it('redirects to a https host name when request is not https AND "https" option is configured',
    done => {
      const app = express();

      const options = {
        forceProtocol: 'https',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.example.com');
      const expected = 'https://www.example.com/';

      appTest
        .get('/')
        .expect(301)
        .expect((res) => {
          if (res.headers.location !== expected) {
            throw new Error(`Expected location: ${expected} Received: ${res.headers.location}`);
          }
        })
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

  it('does not redirect when configured with the "none" option regardless of protocol',
    (done) => {
      const app = express();

      const options = {
        forceProtocol: 'none',
      };

      app.use(normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = createVhostTester(app, 'www.example.com');

      appTest
        .get('/path')
        .expect(200)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
});


describe('Force WWW Hostname', () => {
  it('redirects to a www host name when it is missing AND "www" option is configured',
    done => {
      const app = express();

      const options = {
        forceWww: 'www',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'example.com');
      const expected = 'http://www.example.com/path';

      appTest
        .get('/path')
        .expect(301)
        .expect(res => {
          if (res.headers.location !== expected) {
            throw new Error(`Expected location: ${expected} Received: ${res.headers.location}`);
          }
        })
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('redirects to a host name without www when it is present AND "no-www" option is configured',
    done => {
      const app = express();

      const options = {
        forceWww: 'no-www',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.example.com');
      const expected = 'http://example.com/path';

      appTest
        .get('/path')
        .expect(301)
        .expect(res => {
          if (res.headers.location !== expected) {
            throw new Error(`Expected location: ${expected} Received: ${res.headers.location}`);
          }
        })
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('does not redirect when configured with the "none" option regardless of WWW in hostname',
    done => {
      const app = express();

      const options = {
        forceWww: 'none',
      };

      app.use(normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = createVhostTester(app, 'example.com');

      appTest
        .get('/path')
        .expect(200)
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });
});


describe('Force Trailing Slash in Path', () => {
  it('redirects to a URL without a trailing forward slash when configured with "trim" option',
    done => {
      const app = express();

      const options = {
        forceTrailingSlash: 'trim',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.example.com');
      const expected = 'http://www.example.com/path';

      appTest
        .get('/path/')
        .expect(301)
        .expect(res => {
          if (res.headers.location !== expected) {
            throw new Error(`Expected location: ${expected} Received: ${res.headers.location}`);
          }
        })
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('redirects to a URL with a trailing forward slash when configured with "keep" option',
    done => {
      const app = express();

      const options = {
        forceTrailingSlash: 'keep',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.example.com');
      const expected = 'http://www.example.com/path/';

      appTest
        .get('/path')
        .expect(301)
        .expect(res => {
          if (res.headers.location !== expected) {
            throw new Error(`Expected location: ${expected} Received: ${res.headers.location}`);
          }
        })
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('does not redirect when configured with the "none" option regardless of trailing slashes', 
    done => {
      const app = express();

      const options = {
        forceTrailingSlash: 'none',
      };

      app.use(normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = createVhostTester(app, 'www.example.com');

      appTest
        .get('/path/')
        .expect(200)
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('does not redirect when configured with the "keep" option and path ends with extension', function (done) {
      let app = express();

      let options = {
          forceTrailingSlash: 'keep',
        };

      app.use(normy(options));
      app.get('/path.html', function (req, res) {
          res.send('Success');
        });

      let appTest = createVhostTester(app, 'www.example.com');

      appTest
            .get('/path.html')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });
});


describe('Force URL Case', function () {
  it('redirects to a lowercase url when uppercase letters are present AND "lower" option configured', function (done) {
      let app = express();

      let options = {
          forceCase: 'lower',
        };

      app.use(normy(options));

      let appTest = createVhostTester(app, 'WWW.Example.COM');
      let expected = 'http://www.example.com/upper';

      appTest
            .get('/Upper')
            .expect(301)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });

  it('redirects to a uppercase url when lowercase letters are present AND "upper" option configured', function (done) {
      let app = express();

      let options = {
          forceCase: 'upper',
        };

      app.use(normy(options));

      let appTest = createVhostTester(app, 'www.Example.com');
      let expected = 'HTTP://WWW.EXAMPLE.COM/LOWER';

      appTest
            .get('/lower')
            .expect(301)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });

  it('does not redirect when configured with the "none" option regardless of URL case', function (done) {
      let app = express();

      let options = {
          forceCase: 'none',
        };

      app.use(normy(options));
      app.get('/Path', function (req, res) {
          res.send('Success');
        });

      let appTest = createVhostTester(app, 'Www.Example.com');

      appTest
            .get('/Path')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });
});

describe('Force Query String Case', function () {
  it('redirects to a lowercase query string when uppercase letters are present AND "lower" option configured', function (done) {
      let app = express();

      let options = {
          forceCaseQuery: 'lower',
        };

      app.use(normy(options));

      let appTest = createVhostTester(app, 'www.example.com');
      let expected = 'http://www.example.com/path?qs=lowercase';

      appTest
            .get('/path?Qs=LowerCase')
            .expect(301)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });

  it('redirects to a uppercase url when lowercase letters are present AND "upper" option configured', function (done) {
      let app = express();

      let options = {
          forceCaseQuery: 'upper',
        };

      app.use(normy(options));

      let appTest = createVhostTester(app, 'www.example.com');
      let expected = 'http://www.example.com/path?QS=UPPERCASE';

      appTest
            .get('/path?qS=uppercase')
            .expect(301)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });

  it('does not redirect when configured with the "none" option regardless of URL case', function (done) {
      let app = express();

      let options = {
          forceCase: 'none',
        };

      app.use(normy(options));
      app.get('/path', function (req, res) {
          res.send('Success');
        });

      let appTest = createVhostTester(app, 'www.example.com');

      appTest
            .get('/path?Qs=AnyCase')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });
});

describe('Redirect Types', function () {
  it('redirects using a 301 status code when "301" option configured', function (done) {
      let app = express();

      let options = {
          redirectType: '301',
        };

      app.use(normy(options));

      let appTest = createVhostTester(app, 'example.com');
      let expected = 'http://www.example.com/';

      appTest
            .get('/')
            .expect(301)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });

  it('redirects using a 302 status code when "302" option configured', function (done) {
      let app = express();

      let options = {
          redirectType: '302',
        };

      app.use(normy(options));

      let appTest = createVhostTester(app, 'example.com');
      let expected = 'http://www.example.com/';

      appTest
            .get('/')
            .expect(302)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });
});


describe('Multi-Option Tests', function () {
  it('tests all of the default configurations', function (done) {
      let app = express();

      app.use(normy());

      let appTest = createVhostTester(app, 'Example.com');
      let expected = 'http://www.example.com/path?Qs=Test&qs2=test';

      appTest
            .get('/Path/?Qs=Test&qs2=test')
            .expect(301)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });

  it('tests a completely custom configuration', function (done) {
      let app = express();

      let options = {
          forceProtocol: 'https',
          forceWww: 'no-www',
          forceTrailingSlash: 'keep',
          forceCase: 'upper',
          forceCaseQuery: 'lower',
          redirectType: '302',
        };

      app.use(normy(options));

      let appTest = createVhostTester(app, 'www.example.com');
      let expected = 'HTTPS://EXAMPLE.COM/PATH/?qs=test&qs2=test';

      appTest
            .get('/path?Qs=Test&qs2=test')
            .expect(302)
            .expect(function (res) {
              if (res.headers['location'] !== expected) {
                  throw new Error('Expected location: ' + expected + ' Received: ' + res.headers['location']);
                }
            })
            .end(function (err, res) {
              if (err) return done(err);
              done();
            });
    });
});
