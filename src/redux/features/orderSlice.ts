import { createSlice } from "@reduxjs/toolkit";
import { BaseOrder } from "@/shared/interfaces/seva";
import { ByPost, OrderIn } from "@/shared/interfaces/order-in-card";

interface IState {
  ordersIn: OrderIn[] | BaseOrder[];
  pendingOrders: OrderIn[] | BaseOrder[] | ByPost[];
  pendingNonAndroidOrders: OrderIn[] | BaseOrder[];
  completedOrders: OrderIn[] | BaseOrder[] | ByPost[];
  emergencyPendingOrder: OrderIn[] | BaseOrder[];
  emergencyCompletedOrder: OrderIn[] | BaseOrder[];
  pendingDuplicateOrders: BaseOrder[] | OrderIn[];
  completedDuplicateOrders: BaseOrder[] | OrderIn[];
  pendingIncorrectOrders: BaseOrder[] | OrderIn[];
  completedIncorrectOrders: BaseOrder[] | OrderIn[];
}

const initialState: IState = {
  ordersIn: [],
  pendingOrders: [],
  pendingNonAndroidOrders: [],
  completedOrders: [],
  emergencyPendingOrder: [],
  emergencyCompletedOrder: [],
  pendingDuplicateOrders: [],
  completedDuplicateOrders: [],
  pendingIncorrectOrders: [],
  completedIncorrectOrders: [],
};

type GetOrderPayload = {
  type: keyof IState;
  orders: OrderIn[] | BaseOrder[];
};

type GetOrderAction = {
  payload: GetOrderPayload;
  type: string;
};

type FilterOrderPayload = {
  type: keyof IState;
  id: number;
};

type FilterOrderAction = {
  payload: FilterOrderPayload;
  type: string;
};

type Keys = keyof IState;

type T = (typeof initialState)[keyof IState][0];

type ResetOrderAction = {
  payload: Keys;
  type: string;
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state: IState, action: GetOrderAction) => {
      const { type, orders } = action.payload;
      state[type] = orders;
    },
    updateOrder: (
      state: IState,
      action: {
        payload: {
          data: Partial<T>;
          type: Keys;
        };
        type: string;
      }
    ) => {
      const { type, data } = action.payload;
      // @ts-ignore
      state[type] = [...state[type]].map((t) =>
        t.id == data?.id ? { ...t, ...data } : t
      );
    },
    filterOrders: (state: IState, action: FilterOrderAction) => {
      const { type, id } = action.payload;
      if (Array.isArray(state[type])) {
        // @ts-ignore
        state[type] = state[type]?.filter((el) => el.id !== id);
      }
    },
    resetOrder: (state: IState, action: ResetOrderAction) => {
      const { payload } = action;
      state[payload] = [];
    },
    prepandOrder: (
      state: IState,
      action: { type: string; payload: { key: keyof IState; data: any } }
    ) => {
      const { key, data } = action.payload;
      state[key] = [data, ...state[key]];
    },
  },
});

export const {
  filterOrders,
  updateOrder,
  setOrders,
  resetOrder,
  prepandOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
