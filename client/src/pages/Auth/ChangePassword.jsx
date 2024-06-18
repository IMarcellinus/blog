import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ToastContainer, toast } from "react-toastify"
import { changePassword, setMessageAuth, setPasswordFalse } from "../../../services/store/reducers/Authslice"

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmPassword] = useState('');
  const [newPassValid, setNewPassValid] = useState(false);
  const [confNewPassValid, setConfNewPassValid] = useState(false);
  const [onChangeOld, setOnChangeOld] = useState(false);
  const [onChangeNew, setOnChangeNew] = useState(false);
  const [onChangeConfNew, setOnChangeConfNew] = useState(false);
  const { authUser, passwordChanged, message } = useSelector((states) => states.auth);
  const id = authUser.id;
  const dispatch = useDispatch();
  console.log(id)

  const handleOldPasswordChange = (event) => {
    const value = event.target.value;
    setOldPassword(value);
    setOnChangeOld(true);
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setNewPassword(value);
    setOnChangeNew(true);
    const validNewPass = /[!@#$%^&*,.()]/.test(value) && /[0-9]/.test(value) && value.length >= 8 && /[a-zA-Z]/.test(value);
    if (validNewPass) {
      setNewPassValid(true);
    } else {
      setNewPassValid(false);
    }
  };

  const handleConfPasswordChange = (event) => {
    const value = event.target.value;
    setConfirmPassword(value);
    setOnChangeConfNew(true);
    const validNewPass = /[!@#$%^&*,.()]/.test(value) && /[0-9]/.test(value) && value.length >= 8 && /[a-zA-Z]/.test(value);
    if (validNewPass) {
      setConfNewPassValid(true);
    } else {
      setConfNewPassValid(false);
    }
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();
    dispatch(changePassword({ oldPassword, newPassword, confirmNewPassword, id }));
  };

  useEffect(() => {
    if (passwordChanged == true) {
      toast.success('Berhasil Ganti password');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOnChangeOld(false);
      setOnChangeNew(false);
      setOnChangeConfNew(false);
      dispatch(setPasswordFalse());
    }
  }, [passwordChanged, dispatch]);

  useEffect(() => {
    dispatch(setMessageAuth(''));
  }, [oldPassword, newPassword, confirmNewPassword, dispatch]);
  
  return (
    <div className='bg-white shadow-sm'>
      <ToastContainer />
      <div className='block bg-blue-500 p-4 text-center text-xl uppercase text-white'>
        <h1>Change Password</h1>
      </div>
      <div className='border-b-4' />
      <form onSubmit={submitChangePassword} className='p-4'>
        <p className='text-red-500'>{message}</p>
        <div className='my-2'>
          <label htmlFor='helper-text' className='mb-2 block text-sm font-medium text-gray-900 '>
            Password Lama
          </label>
          <input
            type='password'
            id='helper-text'
            value={oldPassword}
            onChange={handleOldPasswordChange}
            className={
              onChangeOld && oldPassword == ''
                ? 'w-full rounded-lg border-2 border-red-300 bg-gray-50 p-2.5 text-sm text-gray-900 outline-none focus:border-2 focus:border-red-500 focus:ring-red-500 '
                : 'w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 '
            }
            placeholder='masukkan password lama'
          />
          {oldPassword == '' && onChangeOld && <label className='pl-4 text-sm font-medium text-red-900'>Password Tidak Boleh Kosong</label>}
        </div>
        <div className='my-2'>
          <label htmlFor='helper-text2' className='mb-2 block text-sm font-medium text-gray-900'>
            Password Baru
          </label>
          <input
            type='password'
            id='helper-text2'
            value={newPassword}
            onChange={handlePasswordChange}
            className={
              onChangeNew && !newPassValid
                ? 'w-full rounded-lg border-2 border-red-300 bg-gray-50 p-2.5 text-sm text-gray-900 outline-none focus:border-2 focus:border-red-500 focus:ring-red-500  '
                : 'w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  '
            }
            placeholder='masukkan password baru'
          />
          {onChangeNew && !newPassValid && <label className='pl-4 text-sm font-medium text-red-900 '>The password must be containing letters, numbers and symbols</label>}
        </div>
        <div className='my-2'>
          <label htmlFor='helper-text3' className='mb-2 block text-sm font-medium text-gray-900 '>
            Konfirmasi Password Baru
          </label>
          <input
            type='password'
            id='helper-text3'
            value={confirmNewPassword}
            onChange={handleConfPasswordChange}
            className={
              (onChangeNew || onChangeConfNew) && !confNewPassValid
                ? 'w-full rounded-lg border-2 border-red-300 bg-gray-50 p-2.5 text-sm text-gray-900 outline-none focus:border-2 focus:border-red-500 focus:ring-red-500  '
                : 'w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  '
            }
            placeholder='masukkan konfirmasi password baru'
          />
          {(onChangeNew || onChangeConfNew) && !confNewPassValid && <label className='pl-4 text-sm font-medium text-red-900 '>{newPassword != confirmNewPassword ? 'Password Tidak Sama' : 'The password must be at least 8 characters long, containing letters, numbers and symbols'}</label>}
        </div>
        <div className='flex justify-end'>
          <button
            disabled={oldPassword == '' || newPassword == '' || confirmNewPassword == ''}
            type='submit'
            className={
              oldPassword == '' || newPassword == '' || confirmNewPassword == ''
                ? 'mt-2 cursor-not-allowed rounded-lg bg-gray-700/70 px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-300 '
                : 'mt-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 '
            }
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChangePassword