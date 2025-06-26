import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#ffffff] text-[#00768e] py-6 mt-auto border-t border-gray-200">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 px-6">
        <p className="text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} Jobber.
        </p>
        <p className="text-sm text-center md:text-left">
          Created by Eda & Halil
        </p>
      </div>
    </footer>
  );
}
