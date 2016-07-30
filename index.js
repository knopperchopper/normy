var Validator = require('jsonschema').Validator;
var v = new Validator();


// Define Options schema for validation
var optionsSchema = {
    "id": "/Options",
    "type": "object:",
    "properties": {
        "forceProtocol": {
            "enum": ["http", "https", "none"]
        },
        "forceWww": {
            "enum": ["www", "no-www", "none"]
        },
        "forceTrailingSlash": {
            "enum": ["trim", "keep", "none"]
        },
        "forceCase": {
            "enum": ["lower", "upper", "none"]
        },
        "forceCaseQuery": {
            "enum": ["lower", "upper", "none"]
        },
        "redirectType": {
            "enum": ["301", "302"]
        },
    }
}

// Add schema to validator
v.addSchema(optionsSchema, '/Options');



var defaults = {
    forceProtocol: "none",              // Options: http, https, none
    forceWww: 'www',                    // Options: www, no-www, none
    forceTrailingSlash: 'trim',         // Options: trim, keep, none
    forceCase: 'lower',                 // Options: lower, upper, none
    forceCaseQuery: 'none',             // Options: lower, upper, none
    redirectType: "301"                 // Options: 301, 302
}


module.exports = function(opts){
    
    // Handle Options: If option is not passed, use default
    opts.forceProtocol = opts.forceProtocol || defaults.forceProtocol;
    opts.forceWww = opts.forceWww || defaults.forceWww;
    opts.forceTrailingSlash = opts.forceTrailingSlash || defaults.forceTrailingSlash;
    opts.forceCase = opts.forceCase || defaults.forceCase;
    opts.forceProtocol = opts.forceCaseQuery || defaults.forceCaseQuery;
    opts.forceProtocol = opts.redirectType || defaults.redirectType;
    
    
    return function(req, res, next){
        var urlProtocol = req.protocol; 
        var urlHost = req.headers.host; 
        var urlPath = req.originalUrl.split('?')[0]; 
        var urlQueryString = (req.originalUrl.split('?')[1] === undefined ? "" : "?" + req.originalUrl.split('?')[1]); 
        var redirectRequired = false; 

        
        // Force Lowercase Path 
        if(opts.forceCase !== undefined){
            
            if (/[A-Z]/.test(urlPath)) { 
                redirectRequired = true; 
                urlPath = urlPath.toLowerCase(); 
            } 
        }
        else{
            
        }
        
 		// Redirect if Needed 
 		if(redirectRequired){ 
 			res.redirect(301, urlProtocol + "://" + urlHost + urlPath + urlQueryString); 
 		} 
 		else{ 
 			return next(); 
 		} 

    }
}

function HandleOptions(opts){
    opts.forceProtocol = opts.forceProtocol || defaults.forceProtocol;
    opts.forceWww = opts.forceWww || defaults.forceWww;
    opts.forceTrailingSlash = opts.forceTrailingSlash || defaults.forceTrailingSlash;
    opts.forceCase = opts.forceCase || defaults.forceCase;
    opts.forceCaseQuery = opts.forceCaseQuery || defaults.forceCaseQuery;
    opts.redirectType = opts.redirectType || defaults.redirectType;
    
    v.validate(opts, optionsSchema, {throwError: true});
    
    return opts;
}

console.log(HandleOptions({forceWww: "no-www"}));