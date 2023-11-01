import {createSlice} from "@reduxjs/toolkit";

export interface SpinnerState {
  isSpinnerVisible: {
    [key: string]: boolean;
  };
}

export const defaultSpinnerRoot = "spinner-root";

const initialState: SpinnerState = {
  isSpinnerVisible: {
    [defaultSpinnerRoot]: false,
  },
};

const sliceName = "spinner";

export const spinnerSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    resetSpinnerState: (state) => {
      state = initialState;
      return state;
    },
    showSpinner: (
      state,
      action: {
        payload?: string;
        type: string;
      }
    ) => {
      state.isSpinnerVisible[action.payload || defaultSpinnerRoot] = true;
      return state;
    },
    hideSpinner: (
      state,
      action: {
        payload?: string;
        type: string;
      }
    ) => {
      state.isSpinnerVisible[action.payload || defaultSpinnerRoot] = false;
      return state;
    },
  },
});

export const {resetSpinnerState, showSpinner, hideSpinner} = spinnerSlice.actions;

export default spinnerSlice.reducer;
