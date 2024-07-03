import Tippy from "@tippyjs/react";
import axios from "axios"; // Import Axios
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ChartTotalDataManagement from "../components/ChartTotalDataManagement";

function DashboardPage({ authUser }) {
  return (
    <main className="min-h-full w-full sm:px-2 lg:pt-5">
      <div className="grid min-w-full grid-cols-1 grid-rows-2 gap-4 sm:container lg:grid-cols-3 lg:grid-rows-1">
        <ChartTotalDataManagement />
      </div>
    </main>
  );
}

DashboardPage.propTypes = {
  authUser: PropTypes.object,
};

export default DashboardPage;
