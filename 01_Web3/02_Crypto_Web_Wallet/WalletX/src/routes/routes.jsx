import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import App from '../App'
import TransactionPage from '../components/Transactions/TransactionPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'transaction/:blockchain/:address',
        element: <TransactionPage />,
      },
    ],
  },
])