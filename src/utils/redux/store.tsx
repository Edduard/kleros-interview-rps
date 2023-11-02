import {combineReducers, configureStore} from "@reduxjs/toolkit";
import walletReducer, {WalletState, resetWalletState} from "./walletSlice";
import storage from "redux-persist/lib/storage";
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore} from "redux-persist";
import gameInfoReducer, {GameInfoState, resetGameInfoState} from "./gameInfoSlice";
import spinnerReducer, {SpinnerState, resetSpinnerState} from "./spinnerSlice";

export interface RootState {
  wallet: WalletState;
  gameInfo: GameInfoState;
  spinner: SpinnerState;
}

const rootReducer = combineReducers({
  wallet: walletReducer,
  gameInfo: gameInfoReducer,
  spinner: spinnerReducer,
});

// const rootPersistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["wallet"], // specify which parts of the state to persist
// };
// const persistedStore = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export const resetAllStores = () => {
  return (dispatch: any) => {
    dispatch(resetWalletState());
    dispatch(resetGameInfoState());
    dispatch(resetSpinnerState());
  };
};

export type StoreDispatch = typeof store.dispatch;
