import { isRequestAction, createActions, types } from 'redux-resx';

const API_ACTIONS = {
  [types.RESOURCE_FIND_REQUEST]: ['findReceive', 'findError'],
  [types.RESOURCE_GET_REQUEST]: ['getReceive', 'getError'],
  [types.RESOURCE_CREATE_REQUEST]: ['createReceive', 'createError'],
  [types.RESOURCE_UPDATE_REQUEST]: ['updateReceive', 'updateError'],
  [types.RESOURCE_PATCH_REQUEST]: ['patchReceive', 'patchError'],
  [types.RESOURCE_REMOVE_REQUEST]: ['removeReceive', 'removeError'],
};

function call(feathers, action) {
  const { data, params, request, id, options: actionOptions } = action;
  const { url, params: baseParams, request: baseRequest } = actionOptions;

  const service = feathers.service(url);
  switch (action.type) {
    case types.RESOURCE_FIND_REQUEST:
      return service.find(params);
    case types.RESOURCE_GET_REQUEST:
      return service.get(id, params);
    case types.RESOURCE_CREATE_REQUEST:
      return service.create(data);
    case types.RESOURCE_UPDATE_REQUEST:
      return service.update(id, data, params);
    case types.RESOURCE_PATCH_REQUEST:
      return service.patch(id, data, params);
    case types.RESOURCE_REMOVE_REQUEST:
      return service.remove(id, params);
    default:
      throw new Error(`[redux-resx feathers middleware] Unknown resource type '${action.type}'`)
  }
}

export default function createApiMiddleware(feathers) {
  return () => next => (action) => {
    if (!isRequestAction(action)) {
      return next(action);
    }

    const actions = createActions({ name: action.resxns });
    const [receiver, error] = API_ACTIONS[action.type].map(fn => actions[fn]);

    return call(feathers, action)
      .then((result) => {
        next(receiver(result));
        return result;
      })
      .catch((err) => {
        next(error(err));
        return Promise.reject(err);
      });
  };
}
