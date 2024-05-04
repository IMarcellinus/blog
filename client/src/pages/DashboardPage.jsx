import Tippy from "@tippyjs/react";
import axios from "axios"; // Import Axios
import Cookies from "js-cookie";
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function DashboardPage({authUser}) {
  const [imageUrl, setImageUrl] = useState("");
  const id = authUser.id
  console.log("id", id);
  const token = Cookies.get("token");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/barcode/${id}?`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add Authorization header
            },
          }
        );
        setImageUrl(response.data); // Assuming response contains imageUrl
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    if (token && id) {
      fetchImageUrl();
    }
  }, [token, id]); // Include token and id in the dependency array

  return (
    <div>
      <Tippy content="Hello">
        <button>My button</button>
      </Tippy>
      <div className="flex min-w-max justify-center ">
        <img src={imageUrl} alt="QR Code" className="h-[350px] w-[350px] " />
      </div>
    </div>
  );
}

DashboardPage.propTypes = {
  authUser: PropTypes.object,
}

export default DashboardPage;
