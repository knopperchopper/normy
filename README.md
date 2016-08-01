# Normy
Normy is a URL normalization middleware for Express.  The package will allow you to configure normalization rules and then universally 
redirect any request that doesn't follow the rules.

[![Build Status](https://travis-ci.org/knopperchopper/normy.svg?branch=master)](https://travis-ci.org/knopperchopper/normy)

## Install

```bash

npm install --save normy

```

## Usage

```javascript

    var app = require('express');
    var normy = require('normy');
    
    var options = {
        forceProtocol: "none",
        forceWww: "www",
        forceTrailingSlash: "trim",
        forceCase: "lower",
        forceCaseQuery: "none",
        redirectType: "301"    
    }
    
    app.use(normy(options));

```

## Options

| Option                | Required | Valid Values          | Default | Description                       |
| --------------------- | -------- | --------------------- | ------- | --------------------------------- |
| forceProtocol         | no       | http, https, none     | none    | Force redirect to protocol   |
| forceWww              | no       | www, no-www, none     | www     | Force host name to keep or remove www |
| forceTrailingSlash    | no       | trim, keep, none      | trim    | Force path to trim or keep trailing forward slash |
| forceCase             | no       | lower, upper, none    | lower   | Force URL protocol, host name and path to lower or upper case |
| forceCaseQuery        | no       | lower, upper, none    | none    | Force query string to lower or upper case.  **Use with caution** |
| redirectType          | no       | 301, 302              | 301     | Redirect type if requesting URL needs it |


## Test

```bash

npm test

```