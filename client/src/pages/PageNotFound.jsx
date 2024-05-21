import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate()

  return (
    <div className='absolute z-[104] flex h-screen w-screen items-center bg-blue-50'>
      <div className='m-auto flex w-4/5 flex-col items-center justify-center'>
        <h1 className='max-w-min text-9xl font-bold text-sky-600 sm:text-[155px] md:text-[175px]'>404</h1>
        <p className='text-center text-xl lg:text-2xl'>Oops! This Page is Not Found.</p>
        <button onClick={() => navigate('/')} className='mt-4 rounded-lg bg-gradient-to-br from-sky-600 to-sky-500 px-3 py-2 text-sm font-semibold text-white'>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default PageNotFound;
