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

## Pagination (v0.1.0)

**WARNING: This API may change. I'd like feedback on it :)**

Pagination is handled by installing a `resultReducer` on your resource.

```javascript
import pagination from 'redux-resx-feathers-middleware';

const paginate = pagination({ perPage: 10 });
export const users = createResource({
  name: '@resx/USER',
  url: '/users',
  // Add this to paginated endpoints
  resultReducers: {
    find: paginate,
  },
});
```

This will add a `pagination` object to your resource state:

Here is an exmaple when using it in a component:

```javascript
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { users } from '../../resources';

export const UsersPage = React.createClass({
  displayName: 'UsersPage',

  propTypes: {
    findUsers: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    users: PropTypes.object.isRequired,
  },

  componentWillMount() {
    const { findUsers } = this.props;
    findUsers({ roles: 'admin' });
  },

  render() {
    const { users: { items, pagination }, dispatch } = this.props;

    // *** Important bit here **
    // Dispatch pagination.next to fetch the next items.
    // The result of this call will be concatenated onto items.
    const next = () => dispatch(pagination.next);
    return (
      <div>
        <h1>Emails:</h1>
        {JSON.stringify(items.map(i => i.email))}
        {pagination ? <button disabled={!pagination.hasMore} onClick={next}>Next</button> : null}
      </div>
    );
  },
});

function mapStateToProps(state) {
  return {
    users: users.selector(state),
  };
}

const { find: findUsers } = users.actions;

export default connect(mapStateToProps, {
  findUsers,
})(UsersPage);
```

