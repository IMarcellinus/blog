import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReservationList from "./ReservationList";
import {
  getAllReservation,
  getReservation,
  setCurrentPageReservation,
  setReservationSearch,
} from "../../../services/store/reducers/Reservationslice";
import SearchBarReservation from "./SearchBarReservation";
import SkeletonTable from "../../components/Skeleton/SkeletonTable";

const ReservationPage = ({ authUser }) => {
  const {
    reservations,
    isLoading,
    totalPagesReservation,
    currentPageReservation,
    search,
  } = useSelector((state) => state.reservations);

  const fetchData = () => {
    const currentPage = 1;
    if (search) {
      dispatch(
        getAllReservation({ currentPageReservation: currentPage, search })
      );
    } else {
      dispatch(getReservation({ currentPageReservation: currentPage }));
    }
    dispatch(setCurrentPageReservation(0));
  };

  const { isSubmit } = useSelector((state) => state.borrowbooks);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isSubmit) {
      fetchData();
    }
  }, [isSubmit, dispatch]);

  useEffect(() => {
    dispatch(setCurrentPageReservation(0));
    dispatch(setReservationSearch());
  }, [dispatch]);

  useEffect(() => {
    let timeoutId;

    fetchData();
    const delayedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchData, 1000);
    };

    delayedFetch();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, dispatch]);

  useEffect(() => {
    const currentPage = currentPageReservation + 1;
    if (search) {
      dispatch(
        getAllReservation({ currentPageReservation: currentPage, search })
      );
    } else {
      dispatch(getReservation({ currentPageReservation: currentPage }));
    }
  }, [currentPageReservation, dispatch, search]);

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white py-3 text-sm">
            <div>
              <p className="text-lg font-bold">Reservation List</p>
              <div className="mt-2">
                <SearchBarReservation
                  currentPageReservation={currentPageReservation}
                />
              </div>
            </div>
          </div>
          <div>
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <ReservationList
                totalPages={totalPagesReservation}
                currentPageReservation={currentPageReservation}
                isLoading={isLoading}
                reservations={reservations}
                authUser={authUser}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

const authUserShape = {
  role: PropTypes.string.isRequired,
};

ReservationPage.propTypes = {
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default ReservationPage;
