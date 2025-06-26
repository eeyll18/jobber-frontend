import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import CustomField from "../common/CustomField";

export default function LoginForm({ handleSubmit, initialValues }) {
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(1, "Password must be at least 1 characters")
      .required("Password is required"),
  });
  return (
    <div className="flex min-h-screen">
      {/* Sol bölüm */}
      <div
        className="hidden md:flex w-1/2 bg-[#00768e] flex-col justify-center items-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0, 118, 142, 0.7) 0%, rgba(0, 118, 142, 0.5) 50%, rgba(255, 255, 255, 0.2) 100%)",
          backgroundSize: "cover",
          backgroundBlendMode: "multiply",
        }}
      >
        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
        <p className="text-lg">Please sign in to access your account.</p>
      </div>

      {/* Sağ bölüm */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={false} // Alan değiştiğinde doğrulama yapma
          validateOnBlur={false} // Alan kaybedildiğinde doğrulama yapma
        >
          {({ isSubmitting, values, setFieldValue, resetForm, status }) => (
            <Form className="p-8 w-full max-w-md">
              <h2 className="text-3xl font-bold mb-6 text-[#00768e]">
                Sign In
              </h2>
              {status && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                  <span className="text-sm font-medium">
                    {typeof status === "string"
                      ? status
                      : status.message || "An unexpected error occurred"}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <Field
                  as="select"
                  name="role"
                  className="w-full p-2 border rounded-xl text-[#00768e]"
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
              </div>

              {values.role === "user" && (
                <div>
                  <div className="mb-4">
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                    <CustomField
                      type="email"
                      name="email"
                      placeholder="E-mail"
                      className="w-full p-3 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                    <CustomField
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="w-full p-3 border rounded"
                    />
                  </div>
                </div>
              )}

              {values.role === "company" && (
                <div>
                  <div className="mb-4">
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                    <CustomField
                      type="email"
                      name="email"
                      placeholder="E-mail"
                      className="w-full p-3 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                    <CustomField
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="w-full p-3 border rounded"
                    />
                  </div>
                </div>
              )}

              {/* <div className="flex items-center justify-between my-4">
                <label className="flex items-center text-sm text-gray-600">
                  <Field type="checkbox" name="rememberMe" className="mr-1" />
                  Remember Me
                </label>
                <Link className="text-sm text-[#00768e] hover:underline">
                  Forgot Password?
                </Link>
              </div> */}

              <button
                type="submit"
                className="w-full bg-[#00768e] text-white text-xl p-2 rounded hover:bg-[#005f72] transition duration-300"
                disabled={isSubmitting}
              >
                Sign in
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  New here?{" "}
                  <Link
                    to="/sign-up"
                    className="text-[#00768e] font-semibold hover:underline"
                  >
                    Create an account.
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
