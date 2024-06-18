import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../utils/api";

const initialState = {
  booksBorrow: [],
  bookBorrowSearch: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  totalPagesBookBorrow: 1,
  currentPageBookBorrow: 0,
  edit: false,
  isSubmit: false,
  id: null,
  idUser: null,
  bookBorrowId: null,
  isUpdate: false,
  isDelete: false,
  search: "",
  searchDetail: "",
  listBookBorrowDetail: [],
  listBookBorrowDetailSearch: [],
  deleteFail: false,
  fetchBookBorrow: false,
  status: null,
  active: false,
  detailBookBorrow: null,
};

const getToken = async () => {
  const token = await Cookies.get("token");
  return token;
};

export const getAllBookBorrow = createAsyncThunk(
    "books/getAllBookBorrow",
    async ({ currentPageBook, search }, thunkAPI) => {
      const token = await getToken();
      if (!token) {
        return thunkAPI.rejectWithValue("No token found");
      }
      try {
        const token = await getToken();
        const response = await axios.get(
          `${BASE_URL}/book/${currentPageBook}/8/${search}`,
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