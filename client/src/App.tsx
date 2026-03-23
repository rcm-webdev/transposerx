import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transpose from './pages/Transpose'
import Lessons from './pages/Lessons'
import LessonDetail from './pages/LessonDetail'
import Practice from './pages/Practice'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transpose" element={<Transpose />} />
              <Route path="lessons" element={<Lessons />} />
              <Route path="lessons/:slug" element={<LessonDetail />} />
              <Route path="practice" element={<Practice />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
