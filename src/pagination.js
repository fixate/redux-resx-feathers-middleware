import { types, createActions } from 'redux-resx';

function isPaginated(result) {
  return Array.isArray(result.data) && result.total !== null;
}

export default function paginationReducer({ perPage }) {
  return (state, action, options) => {
    const actions = createActions(action.ns, options);
    const { result, requestAction: ra } = action;
    if (action.type != types.RESOURCE_FIND_SUCCESS) { return state; }

    const nextState = {
      hasLoaded: true,
      isBusy: false,
      isFinding: false,
      options,
      pagination: undefined,
    };

    const nextLimit = Math.min(perPage, result.limit);
    const nextSkip = result.skip + nextLimit;

    if (isPaginated(result)) {
      Object.assign(nextState,  {
        items: result.skip > 0 ? state.items.concat(result.data) : result.data,
        pagination: {
          total: result.total,
          limit: result.limit,
          skip: result.skip,
          hasMore: result.skip + result.data.length < result.total,

          next: actions.find({
            ...ra.params,
            query: { ...ra.params.query, $skip: nextSkip, $limit: nextLimit },
          }),
        },
      });
    } else {
      nextState.items = action.result;
    }

    return Object.assign({}, state, nextState);
  }
}

