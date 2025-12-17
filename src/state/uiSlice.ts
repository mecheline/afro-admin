import { createSlice } from "@reduxjs/toolkit";

type UiState = { sidebarOpen: boolean };

const initialState: UiState = { sidebarOpen: false };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openSidebar: (s) => {
      s.sidebarOpen = true;
    },
    closeSidebar: (s) => {
      s.sidebarOpen = false;
    },
    toggleSidebar: (s) => {
      s.sidebarOpen = !s.sidebarOpen;
    },
  },
});

export const { openSidebar, closeSidebar, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
