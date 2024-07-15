import PropTypes from "prop-types";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChartTotalDataManagement from "../components/ChartTotalDataManagement";
import ChartTotalPeminjaman from "../components/ChartTotalPeminjaman";
import ChartTotalUser from "../components/ChartTotalUser";
import ChartSelamatDatang from "../components/ChartSelamatDatang"
import {
  actionCreatorGetDataManagement,
  setIsLoading,
} from "../../services/store/reducers/Dashboardslice";
import { GetDataAvailableBooks } from "../../services/store/reducers/Dashboardslice";
import SkeletonChart from "../components/Skeleton/SkeletonChart";

function DashboardPage({ authUser }) {
  const { isLoading } = useSelector((state) => state.dashboard);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actionCreatorGetDataManagement());
    dispatch(GetDataAvailableBooks());
  }, [dispatch]);

  return (
    <main className="min-h-full w-full sm:px-2 lg:pt-5">
        <div className="col-span-2 h-[100px] w-full rounded-lg lg:col-span-1 lg:row-span-1 flex flex-col items-center justify-between">
          <div className=" h-full w-full mt-2">
            {<ChartSelamatDatang/>}
          </div>
        </div>
    </main>
  );
}

DashboardPage.propTypes = {
  authUser: PropTypes.object,
};

export default DashboardPage;
