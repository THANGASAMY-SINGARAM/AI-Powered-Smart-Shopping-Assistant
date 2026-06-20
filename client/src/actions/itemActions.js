import axios from 'axios';
import {GET_ITEMS, ADD_ITEM, DELETE_ITEM, ITEM_LOADING, GET_AI_INSIGHTS} from './types';
import { tokenConfig } from './authActions';
import { returnErrors } from './errorActions'; 

export const getItems = () => dispatch => {
  dispatch(setItemsLoading());
  axios.get('/api/items')
    .then(res => {
      dispatch({
        type: GET_ITEMS,
        payload: res.data
      });
    })
    .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};

export const getAiInsights = () => dispatch => {
  axios.get('/api/items/ai/suggestions')
    .then(res => {
      dispatch({
        type: GET_AI_INSIGHTS,
        payload: res.data.suggestions || []
      });
    })
    .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};

export const addItem = (item) => (dispatch, getState) => {
  axios.post('/api/items', item, tokenConfig(getState))
    .then(res => {
      dispatch({
        type: ADD_ITEM,
        payload: res.data
      });
      dispatch(getAiInsights());
    })
    .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};

export const deleteItem = (id) => (dispatch, getState) => {
  axios.delete(`/api/items/${id}`, tokenConfig(getState))
    .then(res => {
      dispatch({
        type: DELETE_ITEM,
        payload: id
      });
      dispatch(getAiInsights());
    })
    .catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
};

export const setItemsLoading = () => {
  return {
    type: ITEM_LOADING
  };
};
