# generic-rest-api

Contract agnostic REST API for experimenting with Fabric networks

No code yet but there hopefully will be at some point. Plan A is to give [OpenAPI Generator](https://openapi-generator.tech) a try.

```
docker run --rm \
-v ${PWD}:/local openapitools/openapi-generator-cli generate \
-i /local/api/openapi.yaml \
-g nodejs-express-server \
-o /local/out/nodejs-express-server
```
