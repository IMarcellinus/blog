import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../utils/api";

const initialState = {
  isError: false,
  isPreload: true,
  isSuccess: false,
  isLoading: false,
  isLogin: false,
  user: null,
  message: "",
  messageFetchUser: "",
  username: "",
  loading: false,
  error: null,
  status: null,
  tokenReset: null,
  resetSuccess: false,
  authUser: null,
  fetchUser: false,
  passwordChanged: false,
  newPassword: "",
  confirmNewPassword: "",
};

const setTokenToCookie = (token) => {
  Cookies.set("token", token);
};

const getToken = async () => {
  const token = await Cookies.get("token");
  return token;
};

export const LoginAdmin = createAsyncThunk(
  "auth/loginadmin",
  async (credentials, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/login",
        credentials
      );
      setTokenToCookie(response.data.token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "An error occurred"
      );
    }
  }
);

export const LoginUser = createAsyncThunk(
  "auth/loginuser",
  async (credentials, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/loginuser",
        credentials
      );
      setTokenToCookie(response.data.token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "An error occurred"
      );
    }
  }
);

export const RegisterUser = createAsyncThunk(
  "auth/registeruser",
  async (credentials, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/register",
        credentials
      );
      return response.data.baseImage;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "An error occurred"
      );
    }
  }
);

// Fungsi untuk mengambil data pengguna dari server
export const FetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, thunkAPI) => {
    const token = await getToken();

    try {
      const response = await axios.get(`${BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("errorFatch", error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getBarcodeByuser = createAsyncThunk(
  "auth/getbarcode",
  async (barcode, thunkAPI) => {
    const token = await getToken();
    try {
      const response = await axios.get(`${BASE_URL}/barcode/${barcode.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("errorFatch", error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (password, { rejectWithValue }) => {
    const token = await getToken();
    if (!token) {
      return rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.put(
        `${BASE_URL}/change-password`,
        {
          old_password: password.oldPassword,
          new_password: password.newPassword,
          confirm_new_password: password.confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const message = error.response.data.msg;
      console.log(message)
      return rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      Cookies.remove("token");
      state.user = null;
      state.authUser = null;
    },
    reset: () => initialState,
    setStatus: (state) => {
      state.status = null;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setNewPassword: (state, action) => {
      state.newPassword = action.payload;
    },
    setConfirmNewPassword: (state, action) => {
      state.confirmNewPassword = action.payload;
    },
    forgotReset: (state, action) => {
      state.forgotSuccess = action.payload;
    },
    setResetPassword: (state, action) => {
      state.resetSuccess = action.payload;
    },
    loginSuccess: (state) => {
      state.isSuccess = true;
    },
    setIsLogin: (state, action) => {
      state.isLogin = action.payload;
    },
    setMessageAuth: (state, action) => {
      state.message = action.payload;
    },
    setResetMessage: (state) => {
      state.message = null;
    },
    setFetchUser: (state, action) => {
      state.fetchUser = action.payload;
    },
    setPasswordFalse: (state) => {
      state.passwordChanged = false;
    },
  },
  extraReducers: (builder) => {
    // Login Admin
    builder
      .addCase(LoginAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(LoginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isSuccess = true;
        state.isLogin = true;
        state.user = action.payload;
      })
      .addCase(LoginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.user = null;
        state.message = action.payload.msg;
      });
    // Login Admin
    builder
      .addCase(LoginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(LoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isSuccess = true;
        state.isLogin = true;
        state.user = action.payload;
      })
      .addCase(LoginUser.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.user = null;
        state.message = action.payload.msg;
      });
    // RegisterUser
    builder
      .addCase(RegisterUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(RegisterUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isSuccess = true;
        state.isLogin = true;
        state.user = action.payload;
      })
      .addCase(RegisterUser.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.user = null;
        state.message = action.payload.msg;
      });
    // Fetch User
    builder
      .addCase(FetchUser.pending, (state) => {
        state.isPreload = true;
        state.loading = true;
        state.authUser = null;
      })
      .addCase(FetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authUser = action.payload.user;
        state.isPreload = false;
        state.isSuccess = false;
        state.isLogin = true;
        state.messageFetchUser = action.payload.msg;
        state.status = action.payload.status_code;
        state.username = action.payload.user.username;
        state.fetchUser = true;
      })
      .addCase(FetchUser.rejected, (state, action) => {
        state.isPreload = false;
        state.isLoading = false;
        state.isError = true;
        state.authUser = null;
        state.status = action.payload.status_code;
        state.messageFetchUser = action.payload;
      });
    // Get Barcode by user
    builder
      .addCase(getBarcodeByuser.pending, (state) => {
        state.isPreload = true;
        state.loading = true;
        state.authUser = null;
      })
      .addCase(getBarcodeByuser.fulfilled, (state) => {
        state.isLoading = false;
        state.isPreload = false;
        state.isSuccess = false;
        state.isLogin = true;
      })
      .addCase(getBarcodeByuser.rejected, (state) => {
        state.isPreload = false;
        state.isLoading = false;
        state.isError = true;
        state.authUser = null;
      });
    // changepassword
    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true;
      state.isError = null;
    });
    builder.addCase(changePassword.fulfilled, (state,action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.passwordChanged = true;
      state.message = action.payload.msg;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
      state.passwordChanged = false;
    });
  },
});

export const {
  reset,
  logoutUser,
  passwordFalse,
  setStatus,
  setEmail,
  setNewPassword,
  setConfirmNewPassword,
  forgotReset,
  setResetPassword,
  setIsLogin,
  setMessageAuth,
  setResetMessage,
  setPasswordFalse
} = authSlice.actions;

export default authSlice.reducer;
