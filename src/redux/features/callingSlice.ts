import { createSlice } from "@reduxjs/toolkit";
import { Call, MissCall, RuchiCall } from "@/shared/interfaces/calling";

interface IState {
  bookPendingCalls: Call[];
  bookCompleteCalls: Call[];
  ruchiIn: RuchiCall[];
  ruchiPendingCalls: RuchiCall[];
  ruchiCompleteCalls: RuchiCall[];
  missPendingCalls: MissCall[];
  missCompleteCalls: MissCall[];
  selectedMissCall: MissCall | null;
}

const initialState: IState = {
  bookPendingCalls: [],
  bookCompleteCalls: [],
  ruchiIn: [],
  ruchiPendingCalls: [],
  ruchiCompleteCalls: [],
  missPendingCalls: [],
  missCompleteCalls: [],
  selectedMissCall: null,
};

interface GetCallPayload {
  type: keyof IState;
  calls: any;
}

interface SelectMissCallPayload {
  call: MissCall;
}

interface SelectMissCallAction {
  payload: SelectMissCallPayload;
  type: string;
}
interface GetCallAction {
  payload: GetCallPayload;
  type: string;
}

type ArrState = Exclude<keyof IState, "selectedMissCall">;

interface FilterCallPayload {
  type: Exclude<keyof IState, "selectedMissCall">;
  id: number;
}
interface FilterCallAction {
  payload: FilterCallPayload;
  type: string;
}

type T = (typeof initialState)[ArrState][0];

const callingSlice = createSlice({
  name: "calling",
  initialState,
  reducers: {
    setCalls: (state: IState, action: GetCallAction) => {
      const { calls, type } = action.payload;
      state[type] = calls;
    },
    filterCalls: <T>(state: IState, action: FilterCallAction) => {
      const { id, type } = action.payload;
      if (Array.isArray(state[type])) {
        // @ts-ignore
        state[type] = state[type]?.filter((el) => el.id !== id);
      }
    },
    updateCalls: (
      state: IState,
      action: {
        type: string;
        payload: {
          id: number;
          type: ArrState;
          data: Partial<T>;
        };
      }
    ) => {
      const { type, id, data } = action.payload;
      const callsArr = [...state[type]].map((c) =>
        c.id == id ? { ...c, ...data } : c
      );
      // @ts-ignore
      state[type] = callsArr;
    },
    selectMissCall: (state: IState, action: SelectMissCallAction) => {
      state.selectedMissCall = action.payload.call;
    },
    prepandCall: (
      state: IState,
      action: {
        type: string;
        payload: { key: keyof Omit<IState, "selectedMissCall">; data: any };
      }
    ) => {
      const { key, data } = action.payload;
      state[key] = [data, ...state[key]];
    },
  },
});

export const {
  setCalls,
  selectMissCall,
  updateCalls,
  filterCalls,
  prepandCall,
} = callingSlice.actions;

export default callingSlice.reducer;
