import Tippy from "@tippyjs/react";
import axios from "axios"; // Import Axios
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function DashboardPage({ authUser }) {
  // const id = authUser.id;
  // console.log("id", id);

  return (
    <div>
      <Tippy content="Hello">
        <button>My button</button>
      </Tippy>
    </div>
  );
}

DashboardPage.propTypes = {
  authUser: PropTypes.object,
};

export default DashboardPage;
