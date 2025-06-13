import { combineReducers } from "redux";
import { reducer as authReducer } from "./slices/auth";
import { reducer as roomReducer } from "./slices/room";

const rootReducer = combineReducers({
  auth: authReducer,
  room: roomReducer,
});

export { rootReducer }; 