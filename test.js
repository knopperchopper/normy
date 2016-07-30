var assert = require('chai').assert;
var request = require('supertest');
var express = require('express');
var normy = require('./');

describe('URL Case', function(){

    it('redirects to a lowercase url when uppercase letters are present', function(done){
        var app = express();
        app.use(normy('suck'));
        app.get('/', function(req, res){ 
            res.send("Response"); 
        }); 

        
        request(app)
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
});