import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import LoginForm from "../components/forms/LoginForm";
import { loginSuccess } from "../redux/authSlice";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === "user") {
        navigate("/dashboard/user");
      } else if (role === "company") {
        navigate("/dashboard/company");
      }
    }
  }, [isAuthenticated, navigate, role]);

  const initialValues = {
    email: "",
    password: "",
    role: "user",
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/auth/login`,
        values
      );
      // console.log("Giriş başarılı", response.data);
      localStorage.setItem("token", response.data.token);
      const decoded = jwtDecode(response.data.token);

      dispatch(
        loginSuccess({
          token: response.data.token,
          role: values.role,
          userId: decoded.userId,
        })
      );
      await authService.fetchUser();
      // await authService.login(values); // Kullanıcı bilgilerini ve role alıp redux'a kaydet

      setSubmitting(false);

      if (values.role === "user") {
        navigate("/dashboard/user");
      } else if (values.role === "company") {
        navigate("/dashboard/company");
      }
    } catch (error) {
      // console.error("Giriş başarısız:", error.response?.data || error.message);
      setStatus(error.response?.data || "An unexpected error occurred");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <LoginForm handleSubmit={handleSubmit} initialValues={initialValues} />
    </div>
  );
}
