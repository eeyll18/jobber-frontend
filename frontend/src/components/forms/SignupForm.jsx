import { ErrorMessage, Field, Form, Formik } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import React from "react";
import CustomField from "../common/CustomField";

export default function SignupForm({ handleSubmit, initialValues }) {
  const taxIdRegex = /^[a-zA-Z0-9\s-]*$/;
  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Email is required."),
    password: Yup.string()
      .min(1, "Password must be at least 1 characters long.")
      .required("Password is required."),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match.")
      .required("Required."),
    firstName: Yup.string().when("role", {
      is: "user",
      then: () => Yup.string().required("First Name is required."),
    }),
    lastName: Yup.string().when("role", {
      is: "user",
      then: () => Yup.string().required("Last Name is required."),
    }),
    name: Yup.string().when("role", {
      is: "company",
      then: () => Yup.string().required("Company Name is required."),
    }),
    address: Yup.string().when("role", {
      is: "company",
      then: () => Yup.string().required("Address is required."),
    }),
    phone: Yup.string().when("role", {
      is: "company",
      then: (schema) =>
        schema
          .required("Phone number is required.")
          .matches(phoneRegex, "Please enter a valid phone number format."),
    }),
    taxId: Yup.string().when("role", {
      is: "company",
      then: (schema) =>
        schema
          .required("Tax Identification Number is required.")
          .min(8, "Tax ID must be at least 8 characters")
          .max(20, "Tax ID must be at most 20 characters")
          .matches(
            taxIdRegex,
            "Tax ID allows only letters, numbers, spaces, hyphens."
          ),
    }),
    termsAccepted: Yup.boolean().oneOf(
      [true],
      "You must accept the Privacy Policy."
    ),
  });

  return (
    <div className="flex min-h-screen ">
      {/* Sol bölüm */}
      <div
        className="hidden md:flex w-1/2 bg-[#00768e] flex-col justify-center items-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0, 118, 142, 0.7) 0%, rgba(0, 118, 142, 0.5) 50%, rgba(255, 255, 255, 0.2) 100%)",
          backgroundBlendMode: "multiply",
          backgroundSize: "cover",
        }}
      >
        <h1 className="text-4xl font-bold mb-4">Welcome to Jobber!</h1>
        <p className="text-lg">Create an account and get started today.</p>
      </div>

      {/* Sağ bölüm */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          // validateOnChange={true}
          // validateOnBlur={true}
        >
          {({ isSubmitting, values, setFieldValue, resetForm }) => (
            <Form className="p-8 w-full max-w-md">
              <h2 className="text-3xl font-bold mb-6 text-[#00768e]">
                Sign Up
              </h2>

              <Field
                as="select"
                name="role"
                  className="w-full mb-4 p-2 border border-gray-300 rounded-xl text-[#00768e] focus:outline-none focus:border-[#00768e] focus:ring-1 focus:ring-[#00768e]"
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  resetForm(); // Formu ve hataları sıfırla
                  setFieldValue("role", selectedRole); // Yeni role değerini ayarla
                }}
              >
                <option className="rounded-xl text-[#00768e]" value="user">
                  Employee
                </option>
                <option className="rounded-xl text-[#00768e]" value="company">
                  Employer
                </option>
              </Field>

              {values.role === "user" && (
                <>
                  <div>
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                    <CustomField
                      name="firstName"
                      placeholder="First Name"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                    <CustomField
                      name="lastName"
                      placeholder="Last Name"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}

              {values.role === "company" && (
                <>
                  <div>
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                    <CustomField
                      name="name"
                      placeholder="Name"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                    <CustomField
                      name="address"
                      placeholder="Address"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                    <CustomField
                      name="phone"
                      placeholder="Phone Number"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <ErrorMessage
                      name="taxId"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                    <p
                      id="taxId-description"
                      className="mt-1 text-xs text-gray-500"
                    >
                      Required for verification. Used solely to confirm business
                      identity.
                    </p>
                    <CustomField
                      name="taxId"
                      placeholder="Business Tax ID"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}

              <div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
                <CustomField
                  name="email"
                  placeholder="E-mail"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
                <CustomField
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />
                <CustomField
                  type="password"
                  name="confirmPassword"
                  placeholder="Password Again"
                  className="w-full p-2 border rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00768e] text-white text-xl p-2 rounded hover:bg-[#005f72] transition duration-300"
                disabled={isSubmitting}
              >
                Sign Up
              </button>

              <div className="flex items-start mb-4 mt-2">
                <Field
                  type="checkbox"
                  name="termsAccepted"
                  className="mr-2 mt-1"
                />
                <label className="text-sm text-gray-700">
                  <span>
                    I have read and accept the{" "}
                    <a
                      href="/privacy-policy.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00768e] underline hover:text-[#005f72]"
                    >
                      Privacy Policy.
                    </a>
                  </span>
                </label>
              </div>
              <ErrorMessage
                name="termsAccepted"
                component="div"
                className="text-red-500 text-sm"
              />

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#00768e] font-semibold hover:underline"
                  >
                    Login.
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
