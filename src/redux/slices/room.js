import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const initialState = {
  currentRoom: null,
  isLoading: false,
  error: null,
};

const slice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom(state, action) {
      state.currentRoom = action.payload;
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

export const { setRoom, setLoading, setError } = slice.actions;

export const createRoom = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axiosInstance.post("/rooms/create", data);
    dispatch(setRoom(response.data));
    dispatch(setLoading(false));
    return response.data;
  } catch (error) {
    dispatch(setError(error.response.data.detail));
    dispatch(setLoading(false));
    throw error;
  }
};

export const joinRoom = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axiosInstance.post(
      `/rooms/join/${data.code}`,
      { peer_id: data.peer_id }
    );
    dispatch(setRoom(response.data));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.response.data.detail));
    dispatch(setLoading(false));
  }
}; 