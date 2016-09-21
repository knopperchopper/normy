const assert = require('chai').assert;
const request = require('supertest');
const express = require('express');
const normy = require('./');

describe('Force Protocol', function() {
    
    it('redirects to a https host name when request is not https AND "https" option is configured', function(done){
        var app = express();
        
        var options = {
            forceProtocol: "https"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.example.com');
        var expected = "https://www.example.com/";
        
        appTest
            .get('/')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('does not redirect when configured with the "none" option regardless of protocol', function(done){
        var app = express();
        
        var options = {
            forceProtocol: "none"
        }
        
        app.use(normy(options));
        app.get('/path', function(req, res){
            res.send("Success");
        });

        var appTest = createVhostTester(app, 'www.example.com');
        
        appTest
            .get('/path')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
});


describe('Force WWW Hostname', function(){
    
    it('redirects to a www host name when it is missing AND "www" option is configured', function(done){
        var app = express();
        
        var options = {
            forceWww: "www"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'example.com');
        var expected = "http://www.example.com/path";
        
        appTest
            .get('/path')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('redirects to a host name without www when it is present AND "no-www" option is configured', function(done){
        var app = express();
        
        var options = {
            forceWww: "no-www"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.example.com');
        var expected = "http://example.com/path";
        
        appTest
            .get('/path')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('does not redirect when configured with the "none" option regardless of WWW in hostname', function(done){
        var app = express();
        
        var options = {
            forceWww: "none"
        }
        
        app.use(normy(options));
        app.get('/path', function(req, res){
            res.send("Success");
        });

        var appTest = createVhostTester(app, 'example.com');
        
        appTest
            .get('/path')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
});


describe('Force Trailing Slash in Path', function(){
    
    it('redirects to a URL without a trailing forward slash when configured with "trim" option', function(done){
        var app = express();
        
        var options = {
            forceTrailingSlash: "trim"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.example.com');
        var expected = "http://www.example.com/path";
        
        appTest
            .get('/path/')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('redirects to a URL with a trailing forward slash when configured with "keep" option', function(done){
        var app = express();
        
        var options = {
            forceTrailingSlash: "keep"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.example.com');
        var expected = "http://www.example.com/path/";
        
        appTest
            .get('/path')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('does not redirect when configured with the "none" option regardless of trailing slashes', function(done){
        var app = express();
        
        var options = {
            forceTrailingSlash: "none"
        }
        
        app.use(normy(options));
        app.get('/path', function(req, res){
            res.send("Success");
        });

        var appTest = createVhostTester(app, 'www.example.com');
        
        appTest
            .get('/path/')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('does not redirect when configured with the "keep" option and path ends with extension', function(done){
        var app = express();
        
        var options = {
            forceTrailingSlash: "keep"
        }
        
        app.use(normy(options));
        app.get('/path.html', function(req, res){
            res.send("Success");
        });

        var appTest = createVhostTester(app, 'www.example.com');
        
        appTest
            .get('/path.html')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
});


describe('Force URL Case', function(){

    it('redirects to a lowercase url when uppercase letters are present AND "lower" option configured', function(done){
        var app = express();
        
        var options = {
            forceCase: "lower"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'WWW.Example.COM');
        var expected = "http://www.example.com/upper";
        
        appTest
            .get('/Upper')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('redirects to a uppercase url when lowercase letters are present AND "upper" option configured', function(done){
        var app = express();
        
        var options = {
            forceCase: "upper"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.Example.com');
        var expected = "HTTP://WWW.EXAMPLE.COM/LOWER";
        
        appTest
            .get('/lower')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('does not redirect when configured with the "none" option regardless of URL case', function(done){
        var app = express();
        
        var options = {
            forceCase: "none"
        }
        
        app.use(normy(options));
        app.get('/Path', function(req, res){
            res.send("Success");
        });

        var appTest = createVhostTester(app, 'Www.Example.com');
        
        appTest
            .get('/Path')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
});

describe('Force Query String Case', function(){

    it('redirects to a lowercase query string when uppercase letters are present AND "lower" option configured', function(done){
        var app = express();
        
        var options = {
            forceCaseQuery: "lower"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.example.com');
        var expected = "http://www.example.com/path?qs=lowercase";
        
        appTest
            .get('/path?Qs=LowerCase')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('redirects to a uppercase url when lowercase letters are present AND "upper" option configured', function(done){
        var app = express();
        
        var options = {
            forceCaseQuery: "upper"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.example.com');
        var expected = "http://www.example.com/path?QS=UPPERCASE";
        
        appTest
            .get('/path?qS=uppercase')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('does not redirect when configured with the "none" option regardless of URL case', function(done){
        var app = express();
        
        var options = {
            forceCase: "none"
        }
        
        app.use(normy(options));
        app.get('/path', function(req, res){
            res.send("Success");
        });

        var appTest = createVhostTester(app, 'www.example.com');
        
        appTest
            .get('/path?Qs=AnyCase')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
});

describe('Redirect Types', function(){

    it('redirects using a 301 status code when "301" option configured', function(done){
        var app = express();
        
        var options = {
            redirectType: "301"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'example.com');
        var expected = "http://www.example.com/";
        
        appTest
            .get('/')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('redirects using a 302 status code when "302" option configured', function(done){
        var app = express();
        
        var options = {
            redirectType: "302"
        }
        
        app.use(normy(options));

        var appTest = createVhostTester(app, 'example.com');
        var expected = "http://www.example.com/";
        
        appTest
            .get('/')
            .expect(302)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
});


describe('Multi-Option Tests', function(){

    it('tests all of the default configurations', function(done){
        var app = express(); 

        app.use(normy());

        var appTest = createVhostTester(app, 'Example.com');
        var expected = "http://www.example.com/path?Qs=Test&qs2=test";
        
        appTest
            .get('/Path/?Qs=Test&qs2=test')
            .expect(301)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
    it('tests a completely custom configuration', function(done){
        var app = express(); 
        
        var options = {
            forceProtocol: "https",
            forceWww: "no-www",
            forceTrailingSlash: "keep",
            forceCase: "upper",
            forceCaseQuery: "lower",
            redirectType: "302"
        }

        app.use(normy(options));

        var appTest = createVhostTester(app, 'www.example.com');
        var expected = "HTTPS://EXAMPLE.COM/PATH/?qs=test&qs2=test";
        
        appTest
            .get('/path?Qs=Test&qs2=test')
            .expect(302)
            .expect(function(res){ 
                if(res.headers['location'] !== expected){ 
                    throw new Error("Expected location: " + expected + " Received: " +  res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
            
    });
    
});

 // This will create a virtual hostname that unit tests can leverage when needed 
function createVhostTester(app, vhost) { 
    const real = request(app); 
 	const proxy = {}; 
 
    Object.keys(real).forEach(function(methodName) { 
        proxy[methodName] = function() { 
            return real[methodName] 
            .apply(real, arguments) 
            .set('host', vhost); 
        } 
    });  
 
    return proxy; 
} 
