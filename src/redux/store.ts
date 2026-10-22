import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import orders from "./features/orderSlice";
import auth from "./features/authSlice";
import calling from "./features/callingSlice";
import counts from "./features/countSlice";
import channels from "./features/channelSlice";

export const store = configureStore({
  reducer: {
    orders: orders,
    auth,
    calling,
    counts,
    channels,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
