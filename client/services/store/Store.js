import { configureStore } from '@reduxjs/toolkit'
import Authslice from './reducers/Authslice'

export const store = configureStore({
  reducer: {
    auth: Authslice,
  },
})