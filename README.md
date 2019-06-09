# openapi-to-typescript

[![NPM version](https://img.shields.io/npm/v/openapi-to-typescript.svg)](https://www.npmjs.com/package/openapi-to-typescript)
[![Build Status](https://travis-ci.com/ifroz/openapi-to-typescript.svg?branch=master)](https://travis-ci.com/ifroz/openapi-to-typescript) 
[![Greenkeeper badge](https://badges.greenkeeper.io/ifroz/openapi-to-typescript.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Generate TypeScript typings based on az OpenAPI3 schema definition.

# Install

Run `npm install openapi-to-typescript` or `yarn add openapi-to-typescript`

# Usage in javascript

```javascript
const { GenerateTypings } = require('openapi-to-typescript')

const generatedTypescriptCode = await GenerateTypings(openapiSchema)
fs.writeFileSync('out.ts', generatedTypescriptCode)
```

# CLI Usage

`yarn cli --help`

### For development

```javascript
const { GenerateTypings } = require('./dist/index')

GenerateTypings(require('./fixtures/petstore.json')).then((generatedTypescriptCode: string) => {
  fs.writeFileSync('out.ts', generatedTypescriptCode)
})
```