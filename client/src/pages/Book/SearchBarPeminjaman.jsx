import { useDispatch, useSelector } from "react-redux";
import {
    getAllBookBorrow,
    setSearch,
    setSearchDetail,
} from "../../../services/store/reducers/Borrowslice";

const SearchBarPeminjaman = () => {
  const { search, searchDetail, currentPageBookBorrow } = useSelector(
    (state) => state.borrowbooks
  );
  const dispatch = useDispatch();
  const isPeminjamanPage = location.pathname === "/peminjaman";
  const isPengembalianPage = location.pathname === "/pengembalian";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.location.pathname == "/peminjaman" || window.location.pathname == "/pengembalian") {
      dispatch(
        getAllBookBorrow({
          search,
          currentPageBookBorrow: currentPageBookBorrow + 1,
        })
      );
    }
  };

  const handleChange = (e) => {
    if (window.location.pathname == "/peminjaman" || window.location.pathname == "/pengembalian") {
      dispatch(setSearch(e.target.value));
    } else {
      dispatch(setSearchDetail(e.target.value));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <label htmlFor="voice-search" className="sr-only">
          Search
        </label>
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            required
            value={isPeminjamanPage || isPengembalianPage ? search : searchDetail}
            onChange={handleChange}
            id="voice-search"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
            placeholder={isPeminjamanPage ? "Search Borrow Book" : "Search Return Book"}
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBarPeminjaman;
