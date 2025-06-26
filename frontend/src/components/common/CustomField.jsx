import { Field } from "formik";

export default function CustomField({ type, name, placeholder }) {
  return (
    <div className="mb-4">
      <Field
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full p-2 border rounded-xl"
      />
      {/* <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm mt-1"
      /> */}
    </div>
  );
}
