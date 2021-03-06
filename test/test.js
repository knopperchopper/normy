const assert = require('chai').assert;
const vhost = require('./vhost');
const express = require('express');
const normy = require('../');

describe('Force Protocol', () => {
  it('redirects to a https host name when request is not https AND "https" option is configured',
    done => {
      const app = express();

      const options = {
        forceProtocol: 'https',
      };

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.example.com');
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

      app.get('*', normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = vhost(app, 'www.example.com');

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

      app.get('*', normy(options));

      const appTest = vhost(app, 'example.com');
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

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.example.com');
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

      app.get('*', normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = vhost(app, 'example.com');

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

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.example.com');
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

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.example.com');
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

      app.get('*', normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = vhost(app, 'www.example.com');

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

    app.get('*', normy(options));
    app.get('/path.html', (req, res) => {
      res.send('Success');
    });

    const appTest = vhost(app, 'www.example.com');

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

      app.get('*', normy(options));

      const appTest = vhost(app, 'WWW.Example.COM');
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

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.Example.com');
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

      app.get('*', normy(options));
      app.get('/Path', (req, res) => {
        res.send('Success');
      });

      const appTest = vhost(app, 'Www.Example.com');

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

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.example.com');
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

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.example.com');
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

      app.get('*', normy(options));
      app.get('/path', (req, res) => {
        res.send('Success');
      });

      const appTest = vhost(app, 'www.example.com');

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

    app.get('*', normy(options));

    const appTest = vhost(app, 'example.com');
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

      app.get('*', normy(options));

      const appTest = vhost(app, 'example.com');
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

describe('Path Exclusion Tests', () => {
  it('checks a positive match hardcoded path',
    done => {
      const app = express();

      const options = {
        excludedPaths: ['/TEST'],
      };

      app.get('*', normy(options));

      app.get('/TEST', (req, res) => {
        res.send('Hello');
      });

      const appTest = vhost(app, 'Example.com');

      appTest
        .get('/TEST')
        .expect(200)
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('checks a negative match hardcoded path',
    done => {
      const app = express();

      const options = {
        excludedPaths: ['/TEST'],
      };

      app.get('*', normy(options));

      app.get('/TEST', (req, res) => {
        res.send('Hello');
      });

      const appTest = vhost(app, 'Example.com');

      appTest
        .get('/nonmatch')
        .expect(301)
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('checks a positive match in a list of paths',
    done => {
      const app = express();

      const options = {
        excludedPaths: ['/TEST', '/TEST2', '/TEST3'],
      };

      app.get('*', normy(options));

      app.get('/TEST2', (req, res) => {
        res.send('Hello');
      });

      const appTest = vhost(app, 'Example.com');

      appTest
        .get('/TEST2')
        .expect(200)
        .end(err => {
          if (err) return done(err);
          return done();
        });
    });

  it('checks a positive match in a wildcard path',
    done => {
      const app = express();

      const options = {
        excludedPaths: ['.TEST.'],
      };

      app.get('*', normy(options));

      app.get('/myTESTpath/', (req, res) => {
        res.send('Hello');
      });

      const appTest = vhost(app, 'Example.com');

      appTest
        .get('/myTESTpath/')
        .expect(200)
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

      app.get('*', normy());

      const appTest = vhost(app, 'Example.com');
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
        excludedPaths: ['.PATH.'],
      };

      app.get('*', normy(options));

      const appTest = vhost(app, 'www.example.com');
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
