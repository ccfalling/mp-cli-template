import { createStore, combineReducers } from './redux';
import initStatusReducer from './reducers/InitStatus';
import isAuthReducer from './reducers/isAuth';

const store = createStore(combineReducers({
    initStatus: initStatusReducer,
    isAuth: isAuthReducer,
}))

export default store;
