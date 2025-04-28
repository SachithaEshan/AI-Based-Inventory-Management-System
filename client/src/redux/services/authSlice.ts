import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type TUser = {
  _id: string
  email: string
  exp: number
  iat: number
}

interface InitialState {
  user: null | TUser
  token: null | string
}

// Get initial state from localStorage
const getInitialState = (): InitialState => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    user: user ? JSON.parse(user) : null,
    token: token || null
  };
};

const initialState: InitialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ token: string, user: TUser }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      // Save to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  }
});

export const { loginUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;

export const getCurrentUser = (state: RootState) => state.auth.user;
export const getCurrentToken = (state: RootState) => state.auth.token;
