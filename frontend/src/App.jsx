import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Goals from './pages/Goals'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'

const isAuth = () => !!localStorage.getItem('margin_token')

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={isAuth() ? <Onboarding /> : <Navigate to="/login" />} />
      <Route path="/" element={isAuth() ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="goals" element={<Goals />} />
        <Route path="chat" element={<Chat />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
