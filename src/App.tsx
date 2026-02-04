import { Routes, Route } from 'react-router-dom';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DevToolbar } from '@/components/dev/DevToolbar';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

// Import pages
import HomePage from './pages/Home';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import SearchPage from './pages/Search';
import TutorProfilePage from './pages/tutors/TutorProfile';
import DashboardPage from './pages/dashboard/Dashboard';
import ParentDashboardPage from './pages/dashboard/Parent';
import TutorDashboardPage from './pages/dashboard/Tutor';
import BookingsPage from './pages/bookings/Bookings';
import BookLessonPage from './pages/book/BookLesson';
import TutorProfilePageEdit from './pages/tutor/Profile';
import TutorVerifyPage from './pages/tutor/Verify';
import AdminDashboardPage from './pages/admin/Dashboard';
import AdminVerificationsPage from './pages/admin/Verifications';
import ChatPage from './pages/chat/Chat';
import CompleteLessonPage from './pages/lessons/Complete';

export default function App() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:28',message:'App component rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  return (
    <ErrorBoundary>
      {/* #region agent log */}
      {(() => { fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:31',message:'Inside ErrorBoundary',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{}); return null; })()}
      {/* #endregion */}
      <Providers>
        {/* #region agent log */}
        {(() => { fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:34',message:'Inside Providers',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{}); return null; })()}
        {/* #endregion */}
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1 pt-16">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/tutors/:id" element={<TutorProfilePage />} />
              
              {/* Protected routes with DashboardLayout */}
              <Route path="/book/:tutorId" element={<BookLessonPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/dashboard/parent"
                element={
                  <DashboardLayout>
                    <ParentDashboardPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/tutor"
                element={
                  <DashboardLayout>
                    <TutorDashboardPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/bookings"
                element={
                  <DashboardLayout>
                    <BookingsPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/tutor/profile"
                element={
                  <DashboardLayout>
                    <TutorProfilePageEdit />
                  </DashboardLayout>
                }
              />
              <Route
                path="/tutor/verify"
                element={
                  <DashboardLayout>
                    <TutorVerifyPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <DashboardLayout>
                    <AdminDashboardPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/admin/verifications"
                element={
                  <DashboardLayout>
                    <AdminVerificationsPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/chat/:bookingId"
                element={
                  <DashboardLayout>
                    <ChatPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/lessons/:id/complete"
                element={
                  <DashboardLayout>
                    <CompleteLessonPage />
                  </DashboardLayout>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <DevToolbar />
      </Providers>
      <Toaster />
    </ErrorBoundary>
  );
}
