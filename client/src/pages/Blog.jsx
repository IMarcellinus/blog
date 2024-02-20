import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { FaLongArrowAltLeft } from "react-icons/fa";
import Header from "../layout/Header";

function Blog() {
  const [apiDatas, setApiDatas] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_DEV_URL + "/" + params.id;
        const response = await axios.get(apiUrl);
        if (response.status === 200) {
          if (response?.data.statusText === "Ok") {
            setApiDatas(response?.data?.blog);
          }
        } else {
          console.log("Error bro!");
        }
      } catch (error) {
        console.log(error.response);
      }
    };
    fetchData();
  }, [params.id]);

  return (
    <div className="bg-red-200">
      <Header />
      <Link to="/">
        <FaLongArrowAltLeft className="h-12 w-12" />
      </Link>

      <h1 className="font-bold text-2xl">Blog Details Page</h1>
      <div>
        <h1>Title : {apiDatas.title}</h1>
        <h3>Post : {apiDatas.post}</h3>
      </div>
    </div>
  );
}

export default Blog;
