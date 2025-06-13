import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";
import Cookies from "js-cookie";

const initialState = {
  isLoggedIn: false,
  token: null,
  user: null,
  isLoading: false,
  error: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
      Cookies.remove("token");
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { reducer } = slice;

export const { login, logout, setLoading, setError } = slice.actions;

export const loginUser = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const form = new URLSearchParams();
    form.append("username", data.username);
    form.append("password", data.password);

    const response = await axiosInstance.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const { access_token, user } = response.data;
    Cookies.set("token", access_token, { expires: 1 });
    dispatch(login({ token: access_token, user }));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.response.data.detail));
    dispatch(setLoading(false));
  }
};

export const registerUser = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await axiosInstance.post("/auth/register", data);
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.response.data.detail));
    dispatch(setLoading(false));
  }
}; 