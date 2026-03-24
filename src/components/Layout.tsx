import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <header className="topbar">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="תפריט">
          &#9776;
        </button>
        <h1 className="topbar-title">מרכז הפיקוד</h1>
      </header>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="content">{children}</main>
    </div>
  )
}
