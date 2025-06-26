import { Routes, Route } from "react-router-dom";
import "./App.css";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { authService } from "./services/authService";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import UserDashboard from "./pages/UserDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import { loginSuccess, logoutSuccess } from "./redux/authSlice";
import CreateJob from "./components/forms/CreateJob";
import JobListings from "./pages/JobListings";
import ProfileCompany from "./pages/ProfileCompany";
import JobPostings from "./pages/JobPostings";
import JobDetail from "./pages/JobDetail";
import AppliedJobs from "./pages/AppliedJobs";
import Main from "./pages/Main";
import ApplicantProfile from "./pages/ApplicantProfile";
import CompanyPage from "./pages/CompanyPage";
import SearchResult from "./pages/SearchResult";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.fetchUser();
        if (userData) {
          dispatch(loginSuccess({ ...userData, loading: false }));
        }
      } catch (error) {
        console.error("Kullanıcı yüklenemedi:", error);
        localStorage.removeItem("token");
        dispatch(logoutSuccess());
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [dispatch]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<Signup />} />
      <Route
        path="/dashboard/user"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/company"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/company/create"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <CreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-listings"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <JobListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <ProfileCompany />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          // Dinamik userId parametresi
          <ProtectedRoute requiredRole="company">
            <ApplicantProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-postings"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <JobPostings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job/:jobId"
        element={
          <ProtectedRoute allowedRoles={["company"]}>
            <JobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <AppliedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/:companyId"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <CompanyPage />
          </ProtectedRoute>
        }
      />
      <Route path="/search-results" element={<SearchResult />} />
    </Routes>
  );
}

export default App;
