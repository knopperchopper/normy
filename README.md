# Normy
Normy is a URL normalization middleware for Express.  The package will allow you to configure normalization rules and then universally 
redirect any GET request that doesn't follow the rules.

[![Build Status](https://travis-ci.org/knopperchopper/normy.svg?branch=master)](https://travis-ci.org/knopperchopper/normy)

## Install

```bash

npm install --save normy

```

## Usage

```javascript

    const app = require('express');
    const normy = require('normy');
    
    const options = {
      forceProtocol: 'none',
      forceWww: 'www',
      forceTrailingSlash: 'trim',
      forceCase: 'lower',
      forceCaseQuery: 'none',
      redirectType: '301',
      excludedPaths: ['/MyPath', '/MySecondPath', '^MyRegEx'],
    }
    
    // Middleware for all GET routes
    app.get('*', normy(options));

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
| excludedPaths         | no       | [string1, string2..]  | []      | Exclude paths from normalization rules.  Array of RegEx strings |


## Test

```bash

npm test

```