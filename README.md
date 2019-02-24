# openapi-to-typescript

[![NPM version](https://img.shields.io/npm/v/openapi-to-typescript.svg)](https://www.npmjs.com/package/openapi-to-typescript)
[![Build Status](https://travis-ci.com/ifroz/openapi-to-typescript.svg?branch=master)](https://travis-ci.com/ifroz/openapi-to-typescript) 
[![Greenkeeper badge](https://badges.greenkeeper.io/ifroz/openapi-to-typescript.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Generate TypeScript typings based on az OpenAPI3 schema definition.

# Install

`npm install openapi-to-typescript`

`yarn add openapi-to-typescript`

# Usage

```javascript
const { GenerateTypings } = require('openapi-to-typescript')

const generatedTypescript = await GenerateTypings(openapiSchema)
fs.writeFileSync('out.d.ts', generatedTypescript.toString())

```

### For development

```javascript
const { GenerateTypings } = require('./dist/index')

GenerateTypings(require('./fixtures/petstore.json')).then((typeStore) => {
  fs.writeFileSync('./dist/out.d.ts', typeStore.toString())
})
```