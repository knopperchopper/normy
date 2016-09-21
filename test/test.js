const assert = require('chai').assert;
const request = require('supertest');
const express = require('express');
const normy = require('../');

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

  it('does not redirect when configured with the "keep" option and path ends with extension',
  done => {
    const app = express();

    const options = {
      forceTrailingSlash: 'keep',
    };

    app.use(normy(options));
    app.get('/path.html', (req, res) => {
      res.send('Success');
    });

    const appTest = createVhostTester(app, 'www.example.com');

    appTest
      .get('/path.html')
      .expect(200)
      .end(err => {
        if (err) return done(err);
        return done();
      });
  });
});


describe('Force URL Case', () => {
  it('redirects to a lowercase url when uppercase letters present AND "lower" option configured',
    done => {
      const app = express();

      const options = {
        forceCase: 'lower',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'WWW.Example.COM');
      const expected = 'http://www.example.com/upper';

      appTest
        .get('/Upper')
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

  it('redirects to a uppercase url when lowercase letters present AND "upper" option configured',
    done => {
      const app = express();

      const options = {
        forceCase: 'upper',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.Example.com');
      const expected = 'HTTP://WWW.EXAMPLE.COM/LOWER';

      appTest
        .get('/lower')
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

  it('does not redirect when configured with the "none" option regardless of URL case',
    done => {
      const app = express();

      const options = {
        forceCase: 'none',
      };

      app.use(normy(options));
      app.get('/Path', (req, res) => {
        res.send('Success');
      });

      const appTest = createVhostTester(app, 'Www.Example.com');

      appTest
        .get('/Path')
        .expect(200)
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });
});

describe('Force Query String Case', () => {
  it('redirects to lowercase query string when uppercase letters present AND "lower" configured',
    done => {
      const app = express();

      const options = {
        forceCaseQuery: 'lower',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.example.com');
      const expected = 'http://www.example.com/path?qs=lowercase';

      appTest
        .get('/path?Qs=LowerCase')
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

  it('redirects to a uppercase url when lowercase letters present AND "upper" option configured',
    done => {
      const app = express();

      const options = {
        forceCaseQuery: 'upper',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.example.com');
      const expected = 'http://www.example.com/path?QS=UPPERCASE';

      appTest
        .get('/path?qS=uppercase')
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

  it('does not redirect when configured with the "none" option regardless of URL case',
    done => {
      const app = express();

      const options = {
        forceCase: 'none',
      };

      app.use(normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = createVhostTester(app, 'www.example.com');

      appTest
        .get('/path?Qs=AnyCase')
        .expect(200)
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });
});

describe('Redirect Types', () => {
  it('redirects using a 301 status code when "301" option configured', done => {
    const app = express();

    const options = {
      redirectType: '301',
    };

    app.use(normy(options));

    const appTest = createVhostTester(app, 'example.com');
    const expected = 'http://www.example.com/';

    appTest
      .get('/')
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

  it('redirects using a 302 status code when "302" option configured',
    done => {
      const app = express();

      const options = {
        redirectType: '302',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'example.com');
      const expected = 'http://www.example.com/';

      appTest
        .get('/')
        .expect(302)
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
});


describe('Multi-Option Tests', () => {
  it('tests all of the default configurations',
    done => {
      const app = express();

      app.use(normy());

      const appTest = createVhostTester(app, 'Example.com');
      const expected = 'http://www.example.com/path?Qs=Test&qs2=test';

      appTest
        .get('/Path/?Qs=Test&qs2=test')
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

  it('tests a completely custom configuration',
    done => {
      const app = express();

      const options = {
        forceProtocol: 'https',
        forceWww: 'no-www',
        forceTrailingSlash: 'keep',
        forceCase: 'upper',
        forceCaseQuery: 'lower',
        redirectType: '302',
      };

      app.use(normy(options));

      const appTest = createVhostTester(app, 'www.example.com');
      const expected = 'HTTPS://EXAMPLE.COM/PATH/?qs=test&qs2=test';

      appTest
        .get('/path?Qs=Test&qs2=test')
        .expect(302)
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
});
