import { NavLink } from 'react-router-dom'
import './Navbar.css'

export function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" end>
          <span className="navbar__pin" aria-hidden="true">📌</span>
          Pinboard
        </NavLink>
        <nav className="navbar__links" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Browse
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Saved
          </NavLink>
          <NavLink to="/post" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Post a job
          </NavLink>
          <NavLink to="/manage" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Manage
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
