var Validator = require('jsonschema').Validator;

// Init default options
var defaults = {
    forceProtocol: "none",
    forceWww: "www",
    forceTrailingSlash: "trim",
    forceCase: "lower",
    forceCaseQuery: "none",
    redirectType: "301"
}


module.exports = function(opts){
    
    // Setup Options: if undefined, use defaults, otherwise pass to option handler
    opts = (opts === undefined ? defaults : SetupOptions(opts));
    
    return function(req, res, next){
        
        // Break down request URL into components
        var urlProtocol = req.protocol; 
        var urlHost = req.headers.host; 
        var urlPath = req.originalUrl.split('?')[0]; 
        var urlQueryString = (req.originalUrl.split('?')[1] === undefined ? "" : "?" + req.originalUrl.split('?')[1]); 
        var redirectRequired = false; 
        var statusCode = parseInt(opts.redirectType);

        
 		// Force HTTP
        if(opts.forceProtocol === "http"){
            if(urlProtocol != "http"){
                redirectRequired = true;
                urlProtocol = "http";
            }
        }
        // FORCE HTTPS
        else if(opts.forceProtocol === "https"){
            if(urlProtocol != "https"){
                redirectRequired = true;
                urlProtocol = "https";
            }
        }
        
 		// Force WWW 
        if(opts.forceWww === "www"){
            var testHost = urlHost.toLowerCase(); // Let's force lower case to make sure we match.
            if (testHost.indexOf("www.") === -1){
                redirectRequired = true;
                urlHost = "www." + urlHost;
            } 
        }
        // Force Remove WWW
        else if(opts.forceWww === "no-www"){
            var testHost = urlHost.toLowerCase(); // Let's force lower case to make sure we match.
            if (testHost.indexOf("www.") === 0){
                redirectRequired = true;
                urlHost = urlHost.slice("www.".length); 
            } 
        }

        
 		// Force Trailing Slash Removal
        if(opts.forceTrailingSlash === "trim"){
            if(urlPath.substr(-1) == '/' && urlPath.length > 1){ 
                redirectRequired = true; 
                urlPath = urlPath.slice(0, -1); 
            }
        }
 		// Force Trailing Slash Keep
        if(opts.forceTrailingSlash === "keep"){
            if(urlPath.substr(-1) != '/' && !/\w+\.([A-Za-z0-9]{3,4})(?=\?|$)/.test(urlPath)){ 
                redirectRequired = true; 
                urlPath = urlPath + "/";
            }
        }

        
        // Force Lowercase
        if(opts.forceCase === "lower"){
            if (/[A-Z]/.test(urlProtocol) || /[A-Z]/.test(urlHost) || /[A-Z]/.test(urlPath)) { 
                redirectRequired = true;
                urlProtocol = urlProtocol.toLowerCase(); 
                urlHost = urlHost.toLowerCase();   
                urlPath = urlPath.toLowerCase(); 
            } 
        }
        // Force Uppercase
        else if(opts.forceCase === "upper"){
            if (/[a-z]/.test(urlProtocol) || /[a-z]/.test(urlHost) || /[a-z]/.test(urlPath)){
                redirectRequired = true; 
                urlProtocol = urlProtocol.toUpperCase(); 
                urlHost = urlHost.toUpperCase();   
                urlPath = urlPath.toUpperCase(); 
            }
        }
        
        // Force Lowercase Query String
        if(opts.forceCaseQuery === "lower"){
            if (/[A-Z]/.test(urlQueryString)) { 
                redirectRequired = true;
                urlQueryString = urlQueryString.toLowerCase(); 
            } 
        }
        // Force Uppercase Query String
        else if(opts.forceCaseQuery === "upper"){
            if (/[a-z]/.test(urlQueryString)){
                redirectRequired = true; 
                urlQueryString = urlQueryString.toUpperCase(); 
            }
        }
        
 		// Compile URL and redirect if needed 
 		if(redirectRequired){
            var compiledUrl = urlProtocol + "://" + urlHost + urlPath + urlQueryString;
 			res.redirect(statusCode, compiledUrl); 
 		} 
 		else{ 
 			return next(); 
 		} 

    }
}

function SetupOptions(opts){
    // Check to see if each option has been configured, if not use default
    opts.forceProtocol = (opts.forceProtocol === undefined ? defaults.forceProtocol : opts.forceProtocol);
    opts.forceWww = (opts.forceWww === undefined ? defaults.forceWww : opts.forceWww);
    opts.forceTrailingSlash = (opts.forceTrailingSlash === undefined ? defaults.forceTrailingSlash : opts.forceTrailingSlash);
    opts.forceCase = (opts.forceCase === undefined ? defaults.forceCase : opts.forceCase);
    opts.forceCaseQuery = (opts.forceCaseQuery === undefined ? defaults.forceCaseQuery : opts.forceCaseQuery);
    opts.redirectType = (opts.redirectType === undefined ? defaults.redirectType : opts.redirectType);
    
    // Validate options against schema
    v.validate(opts, optionsSchema, {throwError: true});
    
    return opts;
}

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

// Add options schema to validator
var v = new Validator();
v.addSchema(optionsSchema, '/Options');
