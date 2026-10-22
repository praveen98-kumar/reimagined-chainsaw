import { createSlice } from "@reduxjs/toolkit";

export interface IChannel {
  id: number;
  name: string;

  [k: string]: string | number;
}

interface IState {
  channels: Array<IChannel>;
}

const initialState: IState = {
  channels: [],
};

const channelSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    setChannels: (
      state: IState,
      action: { type: string; payload: Array<IChannel> }
    ) => {
      state.channels = action.payload;
    },

    updateChannel: (
      state: IState,
      action: { type: string; payload: IChannel }
    ) => {
      state.channels = [...state.channels].map((ch) =>
        ch.id === action.payload.id ? action.payload : ch
      );
    },

    addChannel: (
      state: IState,
      action: { type: string; payload: IChannel }
    ) => {
      state.channels = [...state.channels, action.payload];
    },
  },
});

export const { addChannel, setChannels, updateChannel } = channelSlice.actions;

export default channelSlice.reducer;
