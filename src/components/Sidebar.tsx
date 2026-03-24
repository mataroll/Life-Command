import { NavLink } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const links = [
  { to: '/', label: 'בית', icon: '\u{1F3E0}' },
  { to: '/board', label: 'לוח חקירה', icon: '\u{1F50D}' },
  { to: '/purchases', label: 'רכישות', icon: '\u{1F6D2}' },
  { to: '/debug', label: 'Debug', icon: '\u{1F6E0}' },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>מרכז הפיקוד</h2>
      </div>
      <ul className="sidebar-nav">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
