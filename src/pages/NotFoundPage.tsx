import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <div className="not-found cork-texture">
      <div className="container not-found__inner">
        <span aria-hidden="true" className="not-found__pin">📌</span>
        <h1>404 — this pin is missing</h1>
        <p>The page you're looking for isn't on the board.</p>
        <Link to="/">← Back to all jobs</Link>
      </div>
    </div>
  )
}
