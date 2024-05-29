import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../utils/api";

const initialState = {
  users: [],
  userSearch: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  totalPagesUser: 1,
  currentPageUser: 0,
  edit: false,
  isSubmit: false,
  id: null,
  idUser: null,
  userId: null,
  isUpdate: false,
  isDelete: false,
  nim: "",
  nama: "",
  jeniskelamin: "",
  prodi: "",
  search: "",
  searchDetail: "",
  listUserDetail: [],
  listUserDetailSearch: [],
  deleteFail: false,
  fetchUser: false,
  status: null,
  active: false,
};

const getToken = async () => {
  const token = await Cookies.get("token");
  return token;
};

export const getAllUser = createAsyncThunk(
  "users/getAllUser",
  async ({ currentPageUser, search }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/users/${currentPageUser}/8/${search}`,
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

export const getUser = createAsyncThunk(
    "users/getUser",
    async ({ currentPageUser }, thunkAPI) => {
      const token = await getToken();
      if (!token) {
        return thunkAPI.rejectWithValue("No token found");
      }
      try {
        const token = await getToken();
        const response = await axios.get(
          `${BASE_URL}/users/${currentPageUser}/8`,
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

  export const updateUser = createAsyncThunk(
    "users/updateUser",
    async (update, thunkAPI) => {
      const token = await getToken();
      if (!token) {
        return thunkAPI.rejectWithValue("No token found");
      }
      try {
        const token = await getToken();
        const response = await axios.put(
          `${BASE_URL}/book/${update.id}`,
          {
            nim: update.nim,
            jeniskelamin: update.jeniskelamin,
            nama: update.nama,
            prodi: update.prodi,
            role: update.role
          },
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
  