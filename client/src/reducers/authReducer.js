import{
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    REGISTER_SUCCESS,
    REGISTER_FAIL
}from '../actions/types';

const initialState = {
    token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: null,
    isLoading: false,
    user: null
};

function authReducer(state = initialState, action){
    switch(action.type){
        case USER_LOADING:
            return{
                ...state,
                isLoading: true
            };
        case USER_LOADED:
            return{
                ...state,
                isAuthenticated: true,
                isLoading: false,
                user: action.payload
            };
        case LOGIN_SUCCESS:
        case REGISTER_SUCCESS:
            localStorage.setItem('token', action.payload.token);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('token', action.payload.token);
            }
            return{
                ...state,
                ...action.payload,
                isAuthenticated: true,
                isLoading: false
            };
        case AUTH_ERROR:
        case LOGIN_FAIL:
        case LOGOUT_SUCCESS:
        case REGISTER_FAIL:
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('token');
            }
            return{ 
                ...state,
                token: null,
                user: null,
                isAuthenticated: false,
                isLoading: false
            };
        default:
            return state;
    }
}

export default authReducer;
