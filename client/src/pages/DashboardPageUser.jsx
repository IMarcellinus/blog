import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChartSelamatDatang from "../components/ChartSelamatDatang";
import {
  actionCreatorGetDataManagement,
  GetDataAvailableBooks
} from "../../services/store/reducers/Dashboardslice";

function DashboardPage({ authUser }) {
  const { isLoading } = useSelector((state) => state.dashboard);
  const [recommendations, setRecommendations] = useState([]);
  const [books, setBooks] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actionCreatorGetDataManagement());
    dispatch(GetDataAvailableBooks());

    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/recommend?user_id=${authUser.id}&num_recommendations=5`);
        const data = await response.json();
        setRecommendations(data);
        fetchBookDetails(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    const fetchBookDetails = async (data) => {
      try {
        const bookDetails = await Promise.all(
          data.map(async (rec) => {
            const response = await fetch(`http://127.0.0.1:5000/bookdetails?book_id=${rec.book_id}`);
            return response.json();
          })
        );
        // Extract the actual book details from the array
        const flattenedBookDetails = bookDetails.map(bookArray => bookArray[0]);
        console.log("Fetched book details:", flattenedBookDetails);
        setBooks(flattenedBookDetails);
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };

    fetchRecommendations();
  }, [dispatch, authUser.id]);

  return (
    <main className="min-h-full w-full sm:px-2 lg:pt-5">
      <div className="col-span-2 h-[100px] w-full rounded-lg lg:col-span-1 lg:row-span-1 flex flex-col items-center justify-between">
        <div className="h-full w-full mt-2">
          <ChartSelamatDatang />
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">Rekomendasi Buku untuk Anda</h2>
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <div key={book.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{book.nama_buku}</h3>
                <p className="mt-2">Kode Buku: {book.kode_buku}</p>
                <p className="mt-1 text-gray-600">Kategori: {book.kategori_buku}</p>
                <p className="mt-1 text-gray-600">Tanggal Pengesahan: {book.tanggal_pengesahan}</p>
                <p className="mt-1 text-gray-600">Buku Prodi: {book.book_prodi}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Silahkan Pinjam Buku untuk mendapatkan rekomendasi.</p>
        )}
      </div>
    </main>
  );
}


DashboardPage.propTypes = {
  authUser: PropTypes.object.isRequired,
};

export default DashboardPage;
