import {createSlice} from "@reduxjs/toolkit";
import {Move, undisclosedMove} from "../constants/constants";
import {persistReducer} from "redux-persist";
import storage from "redux-persist/lib/storage";

export interface GameInfoState {
  hostMove: Move;
  guestAddress: string;
  hostUsedPassword: boolean;
}

const initialState: GameInfoState = {
  hostMove: undisclosedMove,
  guestAddress: "",
  hostUsedPassword: true,
};

const sliceName = "gameInfo";

export const gameInfo = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    resetGameInfoState: (state) => {
      state = initialState;
      return state;
    },
    storeHostMove: (
      state,
      action: {
        payload: GameInfoState["hostMove"];
        type: string;
      }
    ) => {
      state.hostMove = action.payload;
      return state;
    },
    storeGuestAddress: (
      state,
      action: {
        payload: GameInfoState["guestAddress"];
        type: string;
      }
    ) => {
      state.guestAddress = action.payload;
      return state;
    },
    storeHostUsedPassword: (
      state,
      action: {
        payload: GameInfoState["hostUsedPassword"];
        type: string;
      }
    ) => {
      state.hostUsedPassword = action.payload;
      return state;
    },
  },
});

const persistConfig = {
  key: sliceName,
  storage,
  version: 1,
  whitelist: ["hostUsedPassword"],
};

export const {resetGameInfoState, storeHostMove, storeGuestAddress, storeHostUsedPassword} = gameInfo.actions;

export default persistReducer(persistConfig, gameInfo.reducer);

// export const {resetGameInfoState, storeHostMove, storeGuestAddress, storeHostUsedPassword} = gameInfo.actions;

// export default gameInfo.reducer;
