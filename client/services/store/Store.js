import { configureStore } from '@reduxjs/toolkit'
import Authslice from './reducers/Authslice'
import Bookslice from './reducers/Bookslice'
import Borrowslice from './reducers/Borrowslice'
import Userslice from './reducers/Userslice'
import DashboardSlice from './reducers/Dashboardslice'
import ReservationSlice from './reducers/Reservationslice'

export const store = configureStore({
  reducer: {
    auth: Authslice,
    books: Bookslice,
    users: Userslice,
    borrowbooks: Borrowslice,
    dashboard: DashboardSlice,
    reservations: ReservationSlice,
  },
})