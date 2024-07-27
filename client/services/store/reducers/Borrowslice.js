import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../utils/api";

const initialState = {
  booksBorrows: [],
  bookBorrowSearch: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  isAscending: false,
  isDescending: false,
  message: "",
  totalPagesBookBorrow: 1,
  currentPageBookBorrow: 0,
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
  kode_buku: "",
  rating: "",
};

const getToken = async () => {
  const token = await Cookies.get("token");
  return token;
};

export const getAllBookBorrow = createAsyncThunk(
  "borrowbooks/getAllBookBorrow",
  async ({ currentPageBookBorrow, search, role }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/${
          role !== "user" ? "borrowbook" : "borrowbookuser"
        }/${currentPageBookBorrow}/8/${search}`,
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

export const getAllBookBorrowAsc = createAsyncThunk(
  "borrowbooks/getAllBookBorrowAscending",
  async ({ currentPageBookBorrow, search, role }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/${
          role !== "user" ? "borrowbookasc" : "borrowbookuserasc"
        }/${currentPageBookBorrow}/8/${search}`,
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

export const getAllBookBorrowDsc = createAsyncThunk(
  "borrowbooks/getAllBookBorrowDescending",
  async ({ currentPageBookBorrow, search, role }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/${
          role !== "user" ? "borrowbookdsc" : "borrowbookuserdsc"
        }/${currentPageBookBorrow}/8/${search}`,
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

export const getBorrowBook = createAsyncThunk(
  "borrowbooks/getBorrowBook",
  async ({ currentPageBookBorrow, role }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/${
          role !== "user" ? "borrowbook" : "borrowbookuser"
        }/${currentPageBookBorrow}/8`,
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

export const getBorrowBookAsc = createAsyncThunk(
  "borrowbooks/getBorrowBookAscending",
  async ({ currentPageBookBorrow, role }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/${
          role !== "user" ? "borrowbookasc" : "borrowbookuserasc"
        }/${currentPageBookBorrow}/8`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("ascending:", response.data)
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getBorrowBookDsc = createAsyncThunk(
  "borrowbooks/getBorrowBookDescending",
  async ({ currentPageBookBorrow, role }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/${
          role !== "user" ? "borrowbookdsc" : "borrowbookuserdsc"
        }/${currentPageBookBorrow}/8`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("descending:", response.data)
      return response.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const createBorrowBook = createAsyncThunk(
  "borrowbooks/createBorrowBooks",
  async (create, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.post(
        `${BASE_URL}/borrowbook`,
        {
          kode_buku: create.kode_buku,
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

export const returnBorrowBook = createAsyncThunk(
  "borrowbooks/returnBorrowBooks",
  async (update, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.put(
        `${BASE_URL}/borrowbook/${update.id}`,
        {
          rating: update.rating,
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

export const BorrowSlice = createSlice({
  name: "borrowbooks",
  initialState,
  reducers: {
    resetStateBorrow: () => {
      return initialState
    },
    setId: (state, action) => {
      state.id = action.payload;
    },
    setBookBorrowId: (state, action) => {
      state.bookBorrowId = action.payload;
    },
    setKodeBuku: (state, action) => {
      state.kode_buku = action.payload;
    },
    setCurrentPageBookBorrow: (state, action) => {
      state.currentPageBookBorrow = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    setStatus: (state) => {
      state.status = null;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setSearchDetail: (state, action) => {
      state.searchDetail = action.payload;
    },
    setDetailBookBorrow: (state, action) => {
      state.detailBookBorrow = action.payload;
    },
    setBookBorrowSearch: (state) => {
      state.bookBorrowSearch = [];
      state.listBookBorrowDetailSearch = [];
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
    setRating: (state, action) => {
      state.rating = action.payload;
    },
    setIsAscending: (state, action) => {
      state.isAscending = action.payload;
    },
    setIsDescending: (state, action) => {
      state.isDescending = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Get BorrowBook using pagination
    builder.addCase(getAllBookBorrow.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllBookBorrow.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.totalPagesBookBorrow = action.payload?.total_page;
      state.bookBorrowSearch = action.payload?.data;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
      state.booksBorrows = [];
    });
    builder.addCase(getAllBookBorrow.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Get BorrowBook Ascending using pagination 
    builder.addCase(getAllBookBorrowAsc.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllBookBorrowAsc.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.totalPagesBookBorrow = action.payload?.total_page;
      state.bookBorrowSearch = action.payload?.data;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
      state.booksBorrows = [];
    });
    builder.addCase(getAllBookBorrowAsc.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Get BorrowBook Descending using pagination 
    builder.addCase(getAllBookBorrowDsc.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllBookBorrowDsc.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.totalPagesBookBorrow = action.payload?.total_page;
      state.bookBorrowSearch = action.payload?.data;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
      state.booksBorrows = [];
    });
    builder.addCase(getAllBookBorrowDsc.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Get BorrowBook Default
    builder.addCase(getBorrowBook.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getBorrowBook.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.booksBorrows = action.payload?.data;
      state.bookBorrowSearch = [];
      state.totalPagesBookBorrow = action.payload?.total_page;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
    });
    builder.addCase(getBorrowBook.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Get BorrowBook Ascending
    builder.addCase(getBorrowBookAsc.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getBorrowBookAsc.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.booksBorrows = action.payload?.data;
      state.bookBorrowSearch = [];
      state.totalPagesBookBorrow = action.payload?.total_page;
      state.isAscending = true;
      state.isDescending = false;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
    });
    builder.addCase(getBorrowBookAsc.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Get BorrowBook Ascending
    builder.addCase(getBorrowBookDsc.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getBorrowBookDsc.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.booksBorrows = action.payload?.data;
      state.bookBorrowSearch = [];
      state.totalPagesBookBorrow = action.payload?.total_page;
      state.isAscending = false;
      state.isDescending = true;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
    });
    builder.addCase(getBorrowBookDsc.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Create Borrow Book
    builder.addCase(createBorrowBook.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(createBorrowBook.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isSubmit = true;
    });
    builder.addCase(createBorrowBook.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
    });

    // Return Borrow Book
    builder.addCase(returnBorrowBook.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(returnBorrowBook.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isUpdate = true;
    });
    builder.addCase(returnBorrowBook.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload;
    });
  },
});

export const {
  setActive,
  setBookBorrowId,
  setBookBorrowSearch,
  setCurrentPageBookBorrow,
  setDeleteFail,
  setDetailBookBorrow,
  setId,
  setIdUser,
  setKodeBuku,
  setMessage,
  setSearch,
  setSearchDetail,
  setStatus,
  resetStateBorrow,
  setRating,
  setIsAscending,
  setIsDescending
} = BorrowSlice.actions;

export default BorrowSlice.reducer;
