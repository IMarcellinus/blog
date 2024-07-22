import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../utils/api";

const initialState = {
  reservations: [],
  reservationSearch: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  totalPagesReservation: 1,
  currentPageReservation: 0,
  search: "",
  searchDetail: "",
  listReservationDetail: [],
  listReservationDetailSearch: [],
};

const getToken = async () => {
  const token = await Cookies.get("token");
  return token;
};

export const getAllReservation = createAsyncThunk(
  "reservations/getAllReservation",
  async ({ currentPageReservation, search }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/reservationbook/${currentPageReservation}/8/${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getReservation = createAsyncThunk(
  "reservations/getReservation",
  async ({ currentPageReservation }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/reservationbook/${currentPageReservation}/8`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const ReservationSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    setCurrentPageReservation: (state, action) => {
      state.currentPageReservation = action.payload;
    },
    setReservationSearch: (state) => {
      state.reservationSearch = [];
      state.listReservationDetailSearch = [];
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setSearchDetail: (state, action) => {
      state.searchDetail = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Reservation using pagination
    builder.addCase(getAllReservation.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllReservation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.totalPagesReservation = action.payload?.total_page;
      state.reservationSearch = action.payload?.data
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
      state.reservations = action.payload?.data;
    });
    builder.addCase(getAllReservation.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Get Reservation Default
    builder.addCase(getReservation.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getReservation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.reservations = action.payload?.data;
      state.reservationSearch = [];
      state.totalPagesReservation = action.payload?.total_page;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = action.payload.status_code;
    });
    builder.addCase(getReservation.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.reservations = [];
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });
  },
});

export const {
    setCurrentPageReservation,
    setReservationSearch,
    setSearch,
    setSearchDetail
  } = ReservationSlice.actions;

export default ReservationSlice.reducer;
