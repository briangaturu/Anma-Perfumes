import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "../features/Auth/Auth.slice";
import cartReducer from "../features/Cart/cartSlice"; // 1. Import Cart Reducer
import { authApi } from "../features/Apis/Auth.Api";
import { categoryApi } from "../features/Apis/Categories.APi";
import { bannerApi } from "../features/Apis/BannerApi";
import { productApi } from "../features/Apis/products.Api";
import { customPerfumeApi } from "../features/Apis/CustomPerfumes.Api";
import { branchApi } from "../features/Apis/Branch.Api";

// Persist Configuration for Auth
const authPersistConfiguration = {
    key: 'auth',
    storage,
    whitelist: ['user', 'token', 'isAuthenticated', 'role']
};

// 2. Persist Configuration for Cart
const cartPersistConfiguration = {
    key: 'cart',
    storage,
    whitelist: ['items', 'totalAmount'] // Persist the items and the sum
};

// Create Persistent Reducers
const persistedAuthReducer = persistReducer(authPersistConfiguration, authReducer);
const persistedCartReducer = persistReducer(cartPersistConfiguration, cartReducer); // 3. Persist Cart

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        cart: persistedCartReducer, // 4. Register Persisted Cart
        [authApi.reducerPath]: authApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [bannerApi.reducerPath]: bannerApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [customPerfumeApi.reducerPath]: customPerfumeApi.reducer,
         [branchApi.reducerPath]: branchApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(
            authApi.middleware, 
            categoryApi.middleware, 
            bannerApi.middleware, 
            productApi.middleware,
            customPerfumeApi.middleware,
            branchApi.middleware
        )
});

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;