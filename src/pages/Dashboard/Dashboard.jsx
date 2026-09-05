import React from 'react'
import Navbar from '@/components/Header/Navbar'
import Home from './Home/Home'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pt-14">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <Home />
      </main>
    </div>
  )
}

export default Dashboard