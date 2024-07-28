import Cookies from "js-cookie";
import { BASE_URL } from "../../../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../utils/axiosInstance";

const initialState = {
  dataTotalManagement: [],
  dataAvailabelBooks: [],
  dataProdi: [],
  availabelBooks: null,
  isError: false,
  isSuccess: false,
  status: null,
  isLoading: false,
  totalSquad: 0,
  totalUser: 0,
  message: "",
};

export const actionCreatorGetDataManagement = createAsyncThunk(
  "dashboard/getDataManagement",
  async (_, thunkAPI) => {
    const token = await Cookies.get("token");
    if (!token) {
      return thunkAPI.rejectWithValue({ message: "No token found" });
    }
    try {
      const response = await axiosInstance.get(`${BASE_URL}/dashboard-all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    });
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const GetDataAvailableBooks = createAsyncThunk(
  "dashboard/getDataAvailableBooks",
  async (_, thunkAPI) => {
    const token = await Cookies.get("token");
    if (!token) {
      return thunkAPI.rejectWithValue({ message: "No token found" });
    }
    try {
      const response = await axiosInstance.get(`${BASE_URL}/available-books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const GetDataBorrowBookProdi = createAsyncThunk(
  "dashboard/getDataBorrowBookProdi",
  async (_, thunkAPI) => {
    const token = await Cookies.get("token");
    if (!token) {
      return thunkAPI.rejectWithValue({ message: "No token found" });
    }
    try {
      const response = await axiosInstance.get(`${BASE_URL}/dashboard-prodi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
)

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setTotalUser: (state, action) => {
      state.totalUser = action.payload
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(actionCreatorGetDataManagement.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(actionCreatorGetDataManagement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.totalUser = action.payload.data[2].total;
        state.dataTotalManagement = action.payload.data;
      })
      .addCase(actionCreatorGetDataManagement.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload?.message || "An error occurred";
        state.status = action.payload?.status_code || 500;
      });
    builder
      .addCase(GetDataAvailableBooks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetDataAvailableBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.dataAvailabelBooks = action.payload.data;
        state.availabelBooks = action.payload.data[0].total;
      })
      .addCase(GetDataAvailableBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.dataAvailabelBooks = action.payload;
        state.message = action.payload?.message || "An error occurred";
        state.status = action.payload?.status_code || 500;
      });
    builder
      .addCase(GetDataBorrowBookProdi.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetDataBorrowBookProdi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.dataProdi = action.payload.data;
      })
      .addCase(GetDataBorrowBookProdi.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.dataProdi = action.payload;
        state.message = action.payload?.message || "An error occurred";
        state.status = action.payload?.status_code || 500;
      });
  },
});

export const {setTotalUser, setIsLoading} = dashboardSlice.actions;

export default dashboardSlice.reducer;
