import {isRequestAction, createActions, types} from 'redux-resx';

const API_ACTIONS = {
  [types.RESOURCE_FIND_REQUEST]: ['findReceive', 'findError'],
  [types.RESOURCE_GET_REQUEST]: ['getReceive', 'getError'],
  [types.RESOURCE_CREATE_REQUEST]: ['createReceive', 'createError'],
  [types.RESOURCE_UPDATE_REQUEST]: ['updateReceive', 'updateError'],
  [types.RESOURCE_PATCH_REQUEST]: ['patchReceive', 'patchError'],
  [types.RESOURCE_REMOVE_REQUEST]: ['removeReceive', 'removeError'],
};

function omit(props, obj) {
  return Object.keys(obj).reduce((acc, k) => {
    if (props.indexOf(k) > -1) {
      return acc;
    }
    return Object.assign(acc, {[k]: obj[k]});
  }, {});
}

function substitute(url, params) {
  if (!params) return url;

  const urlParts = url.split('/');
  const matchedParams = [];
  const newUrl = urlParts
    .map(part => {
      if (part[0] === ':') {
        const param = params[part.substring(1)];
        if (param) {
          matchedParams.push(part.substring(1));
          return encodeURIComponent(param);
        }
      }

      return part;
    })
    .join('/');

  return [newUrl, matchedParams];
}

function call(feathers, action) {
  const {data, params, request, id, options: actionOptions} = action;
  const {url, params: baseParams, request: baseRequest} = actionOptions;

  const allParams = Object.assign({}, baseParams, params);
  const [newUrl, matchedParams] = substitute(url, allParams);

  const newParams = omit(matchedParams, allParams);

  const service = feathers.service(newUrl);
  switch (action.type) {
    case types.RESOURCE_FIND_REQUEST:
      return service.find(newParams);
    case types.RESOURCE_GET_REQUEST:
      return service.get(id, newParams);
    case types.RESOURCE_CREATE_REQUEST:
      return service.create(data, newParams);
    case types.RESOURCE_UPDATE_REQUEST:
      return service.update(id, data, newParams);
    case types.RESOURCE_PATCH_REQUEST:
      return service.patch(id, data, newParams);
    case types.RESOURCE_REMOVE_REQUEST:
      return service.remove(id, newParams);
    default:
      throw new Error(`[redux-resx feathers middleware] Unknown resource type '${action.type}'`);
  }
}

export default function createApiMiddleware(feathers) {
  return () => next => action => {
    if (!isRequestAction(action)) {
      return next(action);
    }

    // Allow action to propogate.
    next(action);

    const actions = createActions(action.ns, {name: action.resxns});
    const [receiver, error] = API_ACTIONS[action.type].map(fn => actions[fn]);

    return call(feathers, action)
      .then(result => {
        next(Object.assign(receiver(result), {requestAction: action}));
        return result;
      })
      .catch(err => {
        next(error(err));
        return Promise.reject(err);
      });
  };
}
