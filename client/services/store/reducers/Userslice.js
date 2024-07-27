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
  barcode: false,
  qrcode: false,
  urlbarcode: "",
  urlqrcode: "",
  isSubmit: false,
  id: null,
  idUser: null,
  userId: null,
  isUpdate: false,
  isDelete: false,
  username: "",
  password: "",
  nim: "",
  nama: "",
  jeniskelamin: "",
  prodi: "",
  search: "",
  searchDetail: "",
  listUserDetail: [],
  listUserDetailSearch: [],
  deleteFail: false,
  status: null,
  active: false,
  detailUser: null,
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

export const createUser = createAsyncThunk(
  "users/createUser",
  async (create, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.post(
        `${BASE_URL}/users`,
        {
          username: create.username,
          password: create.password,
          nim: create.nim,
          nama: create.nama,
          jeniskelamin: create.jeniskelamin,
          prodi: create.prodi,
          role: create.role,
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
        `${BASE_URL}/users/${update.id}`,
        {
          nim: update.nim,
          jeniskelamin: update.jeniskelamin,
          nama: update.nama,
          prodi: update.prodi,
          role: update.role,
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

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async ({ id }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.delete(`${BASE_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getQrCodeById = createAsyncThunk(
  "users/getQrCodeById",
  async ({ id }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(`${BASE_URL}/getuserqrcode/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getBarCodeById = createAsyncThunk(
  "users/getBarCodeById",
  async ({ id }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(`${BASE_URL}/getuserbarcode/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const UserSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setId: (state, action) => {
      state.id = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setNim: (state, action) => {
      state.nim = action.payload;
    },
    setJenisKelamin: (state, action) => {
      state.jeniskelamin = action.payload;
    },
    setNama: (state, action) => {
      state.nama = action.payload;
    },
    setProdi: (state, action) => {
      state.prodi = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setCurrentPageUser: (state, action) => {
      state.currentPageUser = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    setStatus: (state) => {
      state.status = null;
    },
    setEdit: (state, action) => {
      state.edit = action.payload;
    },
    setBarcode: (state, action) => {
      state.barcode = action.payload;
    },
    setQrCode: (state, action) => {
      state.qrcode = action.payload;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setSearchDetail: (state, action) => {
      state.searchDetail = action.payload;
    },
    setUserDetail: (state, action) => {
      state.detailUser = action.payload;
    },
    setUserSearch: (state) => {
      (state.userSearch = []), (state.listUserDetailSearch = []);
    },
    setIdUser: (state, action) => {
      state.idUser = action.payload;
    },
    setDeleteFail: (state, action) => {
      state.deleteFail = action.payload;
    },
    setActive: (state, action) => {
      state.active = action.payload;
    },
    setUrlBarcode: (state, action) => {
      state.urlbarcode = action.payload;
    },
    setUrlQrCode: (state, action) => {
      state.urlqrcode = action.payload;
    },
    setIsSucess: (state, action) => {
      state.isSuccess = action.payload;
    },
    setIsDelete: (state, action) => {
      state.isDelete = action.payload
    }
  },
  extraReducers: (builder) => {
    // Get User using pagination
    builder.addCase(getAllUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.totalPagesUser = action.payload?.total_page;
      state.userSearch = action.payload?.users;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
      state.users = [];
    });
    builder.addCase(getAllUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });
    // Get User Default
    // Get Squad Default
    builder.addCase(getUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.users = action.payload?.users;
      state.userSearch = [];
      state.totalPagesUser = action.payload?.total_page;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
    });
    builder.addCase(getUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });
    // Create User
    builder.addCase(createUser.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(createUser.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isSubmit = true;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload;
    });
    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(updateUser.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isUpdate = true;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload;
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(deleteUser.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isDelete = true;
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.isLoading = false;
      state.deleteFail = true;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
    });

    // Get QR Code By Id
    builder.addCase(getQrCodeById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getQrCodeById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.qrcode = true;
      state.urlqrcode = action.payload?.baseImage;
    });
    builder.addCase(getQrCodeById.rejected, (state, action) => {
      state.isLoading = false;
      state.deleteFail = true;
      state.isError = true;
      state.message = action.payload.msg;
    });
    // Get User By Id
    builder.addCase(getBarCodeById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getBarCodeById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.barcode = true;
      state.urlbarcode = action.payload?.baseImage;
    });
    builder.addCase(getBarCodeById.rejected, (state, action) => {
      state.isLoading = false;
      state.deleteFail = true;
      state.isError = true;
      state.message = action.payload.msg;
    });
  },
});

export const {setId, setBarcode, setQrCode, setUrlQrCode, setIsSucess,setIsDelete, setFetchUser, setUrlBarcode, setUserId, setUsername, setPassword, setNim, setJenisKelamin, setNama, setProdi, setRole, setCurrentPageUser, setMessage, setStatus, setEdit, setSearch, setSearchDetail, setUserDetail, setUserSearch, setIdUser,setDeleteFail, setActive} = UserSlice.actions;

export default UserSlice.reducer;
