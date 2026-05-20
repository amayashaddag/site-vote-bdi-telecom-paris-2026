import { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OidcProvider, useOidcAuth } from './auth/OidcProvider'
import LoginPage from './pages/LoginPage'
import VotePage from './pages/VotePage'
import AlreadyVotedPage from './pages/AlreadyVotedPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useOidcAuth()

  if (loading) {
    return <div className="status">Chargement de l&apos;authentification...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RedirectRoot() {
  const { user, loading } = useOidcAuth()

  if (loading) {
    return <div className="status">Chargement...</div>
  }

  return <Navigate to={user ? '/vote' : '/login'} replace />
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useOidcAuth()

  if (loading) {
    return <div className="status">Chargement de l&apos;authentification...</div>
  }

  if (!user || !isAdmin) {
    return <Navigate to="/vote" replace />
  }

  return children
}

function App() {
  return (
    <OidcProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectRoot />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/vote"
            element={
              <ProtectedRoute>
                <VotePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/already-voted"
            element={
              <ProtectedRoute>
                <AlreadyVotedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </OidcProvider>
  )
}

export default App
