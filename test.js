var assert = require('chai').assert;
var request = require('supertest');
var express = require('express');
var normy = require('./');

describe('URL Path Case', function(){

    it('redirects to a lowercase url path when uppercase letters are present', function(done){
        var app = express();
        app.use(normy({forceCase: "lower"}));
        app.get('/', function(req, res){ 
            res.send("Response"); 
        }); 

        var appTest = createVhostTester(app, 'WWW.example.com');
        appTest
            .get('/Upper')
            .expect(301)
            .expect(function(res){ 
                if(/[A-Z]/.test(res.headers['location'])){ 
                    throw new Error("detected Upper Case Letters in Path: " + res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                console.log(res.headers['location']);
                if (err) return done(err);
                done();
            });
            
    });
    
    it('redirects to a uppercase url path when lowercase letters are present', function(done){
        var app = express();
        app.use(normy({forceCase: "upper"}));
        app.get('/', function(req, res){ 
            res.send("Response"); 
        }); 

        
        request(app)
            .get('/lower')
            .expect(301)
            .expect(function(res){ 
                if(/[a-z]/.test(res.headers['location'])){ 
                    throw new Error("detected Lower Case Letters in Path: " + res.headers['location']); 
                } 
            }) 
            .end(function(err, res) {
                console.log(res.headers['location']);
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
