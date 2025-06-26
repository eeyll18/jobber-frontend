import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MainNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const navigate = useNavigate(); 

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleScrollLinkClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    if (searchQuery.trim()) {
      navigate(
        `/search-results?query=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery(""); 
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white w-full px-6 py-4 flex items-center justify-between shadow-md fixed top-0 left-0 z-50">
      {" "}
      <Link to="/" className="text-4xl font-bold text-[#007998]">
        JOBBER
      </Link>
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex flex-grow max-w-xs lg:max-w-sm mx-4"
      >
        {" "}
        <input
          type="text"
          placeholder="Search job..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 px-3 py-1 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#007998] focus:border-[#007998] w-full text-sm" // Adjusted padding and text size
        />
        <button
          type="submit"
          className="bg-[#007998] text-white px-3 py-1 rounded-r-md hover:bg-[#005270] transition-colors text-sm" // Adjusted padding and text size
        >
          Search
        </button>
      </form>
      <ul className="hidden md:flex items-center gap-4 text-[#007998] font-medium flex-shrink-0">
        {" "}
        <li>
          <a
            href="#home"
            onClick={(e) => handleScrollLinkClick(e, "home")}
            className="hover:text-[#005270] transition-colors"
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#about"
            onClick={(e) => handleScrollLinkClick(e, "about")}
            className="hover:text-[#005270] transition-colors"
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#contact"
            onClick={(e) => handleScrollLinkClick(e, "contact")}
            className="hover:text-[#005270] transition-colors"
          >
            Contact
          </a>
        </li>
        <li>
          <Link
            to="/login"
            className="text-[#007998] border border-[#007998] px-4 py-[7px] rounded hover:bg-[#007998] hover:text-white transition-colors"
          >
            Login
          </Link>
        </li>
        <li>
          <Link
            to="/sign-up"
            className="bg-[#007998] text-white px-4 py-2 rounded hover:bg-[#005270] transition-colors"
          >
            Sign up
          </Link>
        </li>
      </ul>
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#007998] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#007998]"
          aria-label="Toggle menu"
        >
          {!isMobileMenuOpen ? <button>☰</button> : <button>X</button>}
        </button>
      </div>
      <div
        className={`absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-md md:hidden ${
          isMobileMenuOpen ? "flex" : "hidden"
        } flex-col items-center py-4 space-y-4`}
      >
        <form onSubmit={handleSearchSubmit} className=" px-6 flex">
          <input
            type="text"
            placeholder="Search by position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#007998] focus:border-[#007998] w-full"
          />
          <button
            type="submit"
            className="bg-[#007998] text-white px-4 py-2 rounded-r-md hover:bg-[#005270] transition-colors"
          >
            Search
          </button>
        </form>
        <a
          href="#home"
          onClick={(e) => handleScrollLinkClick(e, "home")}
          className="text-[#007998] hover:text-[#005270] transition-colors block"
        >
          Home
        </a>
        <a
          href="#about"
          onClick={(e) => handleScrollLinkClick(e, "about")}
          className="text-[#007998] hover:text-[#005270] transition-colors block"
        >
          About
        </a>
        <a
          href="#contact"
          onClick={(e) => handleScrollLinkClick(e, "contact")}
          className="text-[#007998] hover:text-[#005270] transition-colors block"
        >
          Contact
        </a>
        <Link
          to="/sign-up"
          onClick={handleLinkClick}
          className="bg-[#007998] text-white px-6 py-2 rounded hover:bg-[#005270] transition-colors w-auto"
        >
          Sign up
        </Link>
        <Link
          to="/login"
          onClick={handleLinkClick}
          className="text-[#007998] border border-[#007998] px-6 py-2 rounded hover:bg-[#007998] hover:text-white transition-colors w-auto" // Make button width auto
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
