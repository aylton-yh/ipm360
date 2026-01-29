import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
