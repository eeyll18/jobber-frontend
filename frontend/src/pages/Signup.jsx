import React, { useEffect, useState } from "react";
import axios from "axios";
import SignupForm from "../components/forms/SignupForm";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Signup() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    name: "",
    address: "",
    phone: "",
    taxId: "",
    confirmPassword: "",
    termsAccepted: false,
  };

  const handleSubmit = async (values) => {
    const dataToSend = {
      email: values.email,
      password: values.password,
      role: values.role,
    };

    if (values.role === "user") {
      dataToSend.firstName = values.firstName;
      dataToSend.lastName = values.lastName;
    } else if (values.role === "company") {
      dataToSend.name = values.name;
      dataToSend.address = values.address;
      dataToSend.phone = values.phone;
      dataToSend.taxId = values.taxId;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/auth/sign-up`,
        dataToSend
      );
      setMessage("Registration successful! Redirecting to the login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Kayıt başarısız:", error.response?.data || error.message);
      alert(error.response.data.message);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      if (role === "user") {
        navigate("/dashboard/user");
      } else if (role === "company") {
        navigate("/dashboard/company");
      }
    }
  }, [isAuthenticated, navigate, role]);

  return (
    <div>
      {/* {message && (
        <div className="text-gray-600 text-center font-semibold">{message}</div>
      )} */}
      {message && (
        <>
          <p className="text-gray-600 text-center font-semibold">
            Your account has been created. You will be redirected to the login
            page shortly.
          </p>
        </>
      )}
      <SignupForm handleSubmit={handleSubmit} initialValues={initialValues} />
    </div>
  );
}
