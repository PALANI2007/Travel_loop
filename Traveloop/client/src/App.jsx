import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerification from './pages/OTPVerification';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';
import MyTrips from './pages/MyTrips';
import BudgetTracker from './pages/BudgetTracker';
import PackingChecklist from './pages/PackingChecklist';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent-500/20 border-b-accent-500 rounded-full animate-spin-slow"></div>
        </div>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'glass text-white border-white/10',
            style: {
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<OTPVerification />} />
            
            {/* Explicit /protected route as requested by user */}
            <Route path="/protected" element={<Navigate to="/dashboard" />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="trips" element={<MyTrips />} />
              <Route path="trips/new" element={<CreateTrip />} />
              <Route path="trips/:id" element={<TripDetail />} />
              <Route path="budget" element={<BudgetTracker />} />
              <Route path="checklist" element={<PackingChecklist />} />
              <Route path="settings" element={<UserProfile />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
  
            {/* Catch-all 404 handler */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
                <h1 className="text-9xl font-bold text-primary-500/20 absolute select-none">404</h1>
                <div className="relative z-10 text-center">
                  <h2 className="text-4xl font-bold mb-4">Lost in <span className="text-gradient">Space?</span></h2>
                  <p className="text-slate-400 mb-8 max-w-md">The destination you're looking for doesn't exist. Let's get you back on track.</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="btn-primary"
                  >
                    Return to Base
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
