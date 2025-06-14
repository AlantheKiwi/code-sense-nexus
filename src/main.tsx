
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.tsx' // This remains, but routing is handled here
import IndexPage from './pages/Index.tsx'
import AuthPage from './pages/AuthPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import ProtectedRoute from './components/auth/ProtectedRoute.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from "@/components/ui/sonner" // For potential notifications
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Add other protected routes here */}
          </Route>
          {/* Consider adding a NotFoundPage for unmatched routes */}
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
