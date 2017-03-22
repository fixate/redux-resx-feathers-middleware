# redux-resx-feathers-middleware

Middleware for [redux-resx](https://github.com/fixate/redux-resx) using
`feathers-client`.

```shell
npm install --save redux-resx-feathers-middleware
```

## Usage

```javascript
import resxMiddleware from 'redux-resx-feathers-middleware';

import feathers from 'feathers-client';
import rest from 'feathers-client/rest';

import reducers from './reducers';

// Setup your feathers app - probably in a different file
const app = feathers().configure(rest('/api').fetch(fetch));

export default function createAppStore() {
  return createStore(
    reducers,
    compose(
      applyMiddleware(
        resxMiddleware(app)
      ),
      window.devToolsExtension ? window.devToolsExtension() : (f) => f
    )
  );
}
```

## Websocket support

Not yet - all we'd need to add is websocket events handlers that fire receiver actions
