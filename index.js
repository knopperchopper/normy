var defaults = {
    forceProtocol: 'none',              // Options: http, https, none
    forceWww: 'www',                    // Options: www, no-www, none
    forceTrailingSlash: 'trim',         // Options: trim, keep, none
    forceCase: 'lower',                 // Options: lower, upper, none
    forceCaseQuery: 'none',             // Options: lower, upper, none
    redirectType: 301                   // Options: 301, 302
}


module.exports = function(opts){
    
    
    
    return function(req, res, next){
        var urlProtocol = req.protocol; 
        var urlHost = req.headers.host; 
        var urlPath = req.originalUrl.split('?')[0]; 
        var urlQueryString = (req.originalUrl.split('?')[1] === undefined ? "" : "?" + req.originalUrl.split('?')[1]); 
        var redirectRequired = false; 

        
        // Force Lowercase Path 
        if(opts.forceCase !== undefined){
            if()
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