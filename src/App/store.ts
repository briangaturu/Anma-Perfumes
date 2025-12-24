import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import  authReducer  from "../features/Auth/Auth.slice"
import { authApi } from "../features/Apis/Auth.Api";
import { categoryApi } from "../features/Apis/Categories.APi";
import { bannerApi } from "../features/Apis/BannerApi";

// Create Persist Configuration for auth Slice

 const authPersistConfiguration ={
    key: 'auth',
    storage,
    whitelist: ['user','token','isAuthenticated','role']
 }
//  Create A persistent Reducer for the AUTH
const persistedAuthReducer =persistReducer(authPersistConfiguration,authReducer)


export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        [authApi.reducerPath]: authApi.reducer,
        [categoryApi.reducerPath] : categoryApi.reducer,
        [bannerApi.reducerPath]: bannerApi.reducer,
    },
    middleware: (getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(authApi.middleware, categoryApi.middleware,bannerApi.middleware)
})

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch