import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../utils/api";

const initialState = {
  books: [],
  bookSearch: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  totalPagesBook: 1,
  currentPageBook: 0,
  edit: false,
  isSubmit: false,
  id: null,
  idUser: null,
  bookId: null,
  isUpdate: false,
  isDelete: false,
  nama_buku: "",
  kodeBuku: "",
  tanggal_pengesahan: "",
  search: "",
  searchDetail: "",
  listBookDetail: [],
  listBookDetailSearch: [],
  deleteFail: false,
  fetchBook: false,
  status: null,
  active: false,
  detailBook: null,
};

const getToken = async () => {
  const token = await Cookies.get("token");
  return token;
};

export const getAllBook = createAsyncThunk(
  "books/getAllBook",
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

export const getBook = createAsyncThunk(
  "books/getBook",
  async ({ currentPageBook }, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/book/${currentPageBook}/8`,
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

export const createBook = createAsyncThunk(
  "books/createBook",
  async (create, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.post(
        `${BASE_URL}/book`,
        {
          nama_buku: create.nama_buku,
          tanggal_pengesahan: create.tanggal_pengesahan
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

export const updateBook = createAsyncThunk(
  "books/updateBook",
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
          nama_buku: update.nama_buku,
          tanggal_pengesahan: update.tanggal_pengesahan
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

export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async ({id}, thunkAPI) => {
    const token = await getToken();
    if (!token) {
      return thunkAPI.rejectWithValue("No token found");
    }
    try {
      const token = await getToken();
      const response = await axios.delete(
        `${BASE_URL}/book/${id}`,
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

export const BookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setId: (state, action) => {
      state.id = action.payload;
    },
    setBookId: (state, action) => {
      state.bookId = action.payload;
    },
    setNamaBuku: (state, action) => {
      state.nama_buku = action.payload;
    },
    setKodeBuku: (state, action) => {
      state.kodeBuku = action.payload;
    },
    setTanggalPengesahan: (state, action) => {
      state.tanggal_pengesahan = action.payload;
    },
    setCurrentPageBook: (state, action) => {
      state.currentPageBook = action.payload;
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
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setSearchDetail: (state, action) => {
      state.searchDetail = action.payload;
    },
    setBookDetail: (state, action) => {
      state.detailBook = action.payload;
    },
    setBookSearch: (state) => {
      state.bookSearch = [];
      state.listBookDetailSearch = [];
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
  },
  extraReducers: (builder) => {
    // Get Squad using pagination
    builder.addCase(getAllBook.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllBook.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.totalPagesBook = action.payload?.total_page;
      state.bookSearch = action.payload?.books;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
      state.books = [];
    });
    builder.addCase(getAllBook.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Get Squad Default
    builder.addCase(getBook.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getBook.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.books = action.payload?.books;
      state.bookSearch = [];
      state.totalPagesBook = action.payload?.total_page;
      state.isDelete = false;
      state.isSubmit = false;
      state.isUpdate = false;
      state.status = null;
    });
    builder.addCase(getBook.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
      state.status = action.payload.status_code;
    });

    // Create Book
    builder.addCase(createBook.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(createBook.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isSubmit = true;
    });
    builder.addCase(createBook.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload;
    });
    
    // Update Book
    builder.addCase(updateBook.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(updateBook.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isUpdate = true;
    });
    builder.addCase(updateBook.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload;
    });

    // Delete Book
    builder.addCase(deleteBook.pending, (state) => {
      state.isLoading = true;
      state.isSubmit = false;
    });
    builder.addCase(deleteBook.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isDelete = true;
    });
    builder.addCase(deleteBook.rejected, (state, action) => {
      state.isLoading = false;
      state.deleteFail = true;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.msg;
    });
  },
});

export const {
  setId,
  setBookId,
  setNamaBuku,
  setKodeBuku,
  setTanggalPengesahan,
  setCurrentPageBook,
  setMessage,
  setStatus,
  setEdit,
  setSearch,
  setSearchDetail,
  setBookDetail,
  setBookSearch,
  setIdUser,
  setDeleteFail,
  setActive
} = BookSlice.actions;

export default BookSlice.reducer;
