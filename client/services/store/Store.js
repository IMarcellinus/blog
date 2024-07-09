import { configureStore } from '@reduxjs/toolkit'
import Authslice from './reducers/Authslice'
import Bookslice from './reducers/Bookslice'
import Borrowslice from './reducers/Borrowslice'
import Userslice from './reducers/Userslice'
import DashboardSlice, { dashboardSlice } from './reducers/Dashboardslice'

export const store = configureStore({
  reducer: {
    auth: Authslice,
    books: Bookslice,
    users: Userslice,
    borrowbooks: Borrowslice,
    dashboard: DashboardSlice,
  },
})