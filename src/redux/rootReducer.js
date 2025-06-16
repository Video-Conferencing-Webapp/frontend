import { combineReducers } from "redux";
import authReducer from "./slices/authSlice";
import { reducer as roomReducer } from "./slices/room";

const rootReducer = combineReducers({
  auth: authReducer,
  room: roomReducer,
});

export { rootReducer }; 
