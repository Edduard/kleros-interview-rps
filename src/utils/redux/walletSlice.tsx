import {createSlice} from "@reduxjs/toolkit";
import {persistReducer} from "redux-persist";
import storage from "redux-persist/lib/storage";

export interface WalletState {
  allAccounts: string[];
  currentAddress: string;
  chainId: number;
}

const initialState: WalletState = {
  allAccounts: [],
  currentAddress: "",
  chainId: 0,
};

const sliceName = "wallet";

export const walletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    resetWalletState: (state) => {
      state = initialState;
      return state;
    },
    storeAllAccounts: (
      state,
      action: {
        payload: WalletState["allAccounts"];
        type: string;
      }
    ) => {
      state.allAccounts = action.payload;
      return state;
    },
    storeCurrentAddress: (
      state,
      action: {
        payload: WalletState["currentAddress"];
        type: string;
      }
    ) => {
      state.currentAddress = action.payload;
      return state;
    },
    storeChainId: (
      state,
      action: {
        payload: WalletState["chainId"];
        type: string;
      }
    ) => {
      state.chainId = action.payload;
      return state;
    },
  },
});

const persistConfig = {
  key: sliceName,
  storage,
  version: 1,
};

export const {resetWalletState, storeAllAccounts, storeCurrentAddress, storeChainId} = walletSlice.actions;

export default persistReducer(persistConfig, walletSlice.reducer);
