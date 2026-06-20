import { GET_ITEMS, ADD_ITEM, DELETE_ITEM, ITEM_LOADING, GET_AI_INSIGHTS } from '../actions/types';

const initialState = {
  items: [],
  suggestions: [],
  loading: false
};

function itemReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ITEMS:
      return {
        ...state,
        items: action.payload,
        loading: false
      };
    case ADD_ITEM:
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case GET_AI_INSIGHTS:
      return {
        ...state,
        suggestions: action.payload
      };
    case DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };
    case ITEM_LOADING:
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
}

export default itemReducer;
