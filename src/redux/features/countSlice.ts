import { AppDispatch } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";
import { getApiCounts } from "@/shared/functions/api";

export interface ICount {
  [k: string]: string | number;
}

interface IState {
  bookOrderCounts: ICount;
  bookDeliveryCounts: ICount;
  bookCallingCounts: ICount;
  jyadaRuchiCounts: ICount;
  namdanCallCounts: ICount;
  missCallCounts: ICount;
  bookDeliveryEmergencyCounts: ICount;
  duplicateCounts: ICount;
  incorrectCounts: ICount;
  sincorrectCounts: ICount;
  postOrderCounts: ICount;
  socialMediaCounts: ICount;
  ramainiCounts: ICount;
  pradarshaniCounts: ICount;
}

export type TCount = keyof IState;

const initialState: IState = {
  bookCallingCounts: {
    allot_pending: 0,
    pending_order: 0,
    otd: 0,
    otm: 0,
    ctd: 0,
    ctm: 0,
  },
  bookOrderCounts: { tic: 0, mic: 0, mnc: 0, tnc: 0 },
  bookDeliveryCounts: {
    pending_in: 0,
    pending_out: 0,
    otd: 0,
    otm: 0,
    ctd: 0,
    ctm: 0,
    wao: 0,
    bnro: 0,
  },
  jyadaRuchiCounts: { pending_order: 0, otd: 0, otm: 0, ctd: 0, ctm: 0 },
  missCallCounts: {
    pending_in: 0,
    pending_order: 0,
    otd: 0,
    otm: 0,
    ctd: 0,
    ctm: 0,
  },
  bookDeliveryEmergencyCounts: {
    pending_in: 0,
    pending_out: 0,
    otd: 0,
    otm: 0,
    ctd: 0,
    ctm: 0,
  },
  duplicateCounts: { pending_order: 0, otd: 0, otm: 0, ctd: 0, ctm: 0 },
  incorrectCounts: { pending_order: 0, otd: 0, otm: 0, ctd: 0, ctm: 0 },
  sincorrectCounts: {
    pending_order: 0,
    otd: 0,
    otm: 0,
    ctd: 0,
    ctm: 0,
    not_interested: 0,
  },
  postOrderCounts: { pending_order: 0, otd: 0, otm: 0, ctd: 0, ctm: 0 },
  namdanCallCounts: { pending_order: 0, otd: 0, otm: 0, ctd: 0, ctm: 0 },
  socialMediaCounts: {
    total_sevadar: 0,
    social_media_seva: 0,
  },
  ramainiCounts: {
    bride_member: 0,
    groom_member: 0,
    // pending: 0,
    // complete: 0,
    // first_verified: 0,
    // second_verified: 0,
    // first_reject: 0,
    // second_reject: 0,
  },
  pradarshaniCounts: {
    total_count: 0,
  },
};

export const getCounts =
  (countType: string, stateType: keyof IState, params?: object) =>
  async (dispatch: AppDispatch) => {
    try {
      const counts = await getApiCounts(countType, params);
      dispatch(
        setCounts({
          type: stateType,
          counts,
        }),
      );
    } catch (error) {
      console.log(error);
      dispatch(
        setCounts({
          type: stateType,
          counts: initialState[stateType],
        }),
      );
    }
  };

type CountPayload = {
  key: string;
  value?: number;
};

interface UpdateCountPayload {
  type: keyof IState;
  values: CountPayload[];
}

interface UpdateCountAction {
  payload: UpdateCountPayload;
  type: string;
}

interface SetCountPayload {
  counts: ICount;
  type: keyof IState;
}

interface SetCountAction {
  payload: SetCountPayload;
  type: string;
}

const countSlice = createSlice({
  name: "counts",
  initialState,
  reducers: {
    setCounts: (state: IState, action: SetCountAction) => {
      const { type, counts } = action.payload;
      state[type] = counts;
    },
    resetCounts: (
      state: IState,
      action: { payload: { type: keyof IState }; type: string },
    ) => {
      const { type } = action.payload;
      state[type] = initialState[type];
    },
    updateCounts: (state: IState, action: UpdateCountAction) => {
      const {
        payload: { values, type },
      } = action;

      const temp = values.reduce((acc, { value = 1, key }) => {
        return {
          ...acc,
          [key]: Number(state[type][key]) + value,
        };
      }, {});
      state[type] = { ...state[type], ...temp };
    },
  },
});

export const { updateCounts, resetCounts, setCounts } = countSlice.actions;

export default countSlice.reducer;
