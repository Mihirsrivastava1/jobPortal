import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { JobDetailPage } from './pages/JobDetailPage'
import { ManagePage } from './pages/ManagePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostJobPage } from './pages/PostJobPage'
import { SavedJobsPage } from './pages/SavedJobsPage'

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/post" element={<PostJobPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
