import {combineReducers, configureStore} from "@reduxjs/toolkit";
import walletReducer, {WalletState} from "./walletSlice";
import storage from "redux-persist/lib/storage";
import {FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore} from "redux-persist";
import gameInfoReducer, {GameInfoState} from "./gameInfoSlice";

export interface RootState {
  wallet: WalletState;
  gameInfo: GameInfoState;
}

const rootReducer = combineReducers({
  wallet: walletReducer,
  gameInfo: gameInfoReducer,
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
