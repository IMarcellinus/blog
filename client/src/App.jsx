import "./index.css";

import { useEffect, useState } from "react";

import axios from "axios";

function App() {
  const [apiDatas, setApiDatas] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_DEV_URL}/api/blog`;
        const response = await axios.get(apiUrl);
        if (response.status === 200) {
          if (response?.data.statusText === "Ok") {
            setApiDatas(response?.data?.blog);
          }
        } else {
          console.log("Error bro!")
        }
      } catch (error) {
        console.log(error.response);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="bg-red-200 mx-auto max-w-[1440px] flex flex-col items-center justify-center">
      <h1 className="text-lg font-bold underline">Hello world!</h1>
      <div className="bg-blue-300 w-9/12 overflow-x-auto">
        <table className="relative w-full bg-neutral-300 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <caption>Table Blog List</caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Id</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Post</th>
            </tr>
          </thead>
          <tbody>
            {apiDatas && apiDatas.map((apiData, index) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{apiData.id}</th>
                <th className="px-6 py-3">{apiData.title}</th>
                <th className="px-6 py-3">{apiData.post}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
