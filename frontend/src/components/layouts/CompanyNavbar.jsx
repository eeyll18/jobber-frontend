import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useDispatch } from "react-redux";
import { logoutSuccess } from "../../redux/authSlice";

export default function CompanyNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await authService.logout();
    dispatch(logoutSuccess());
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const baseLinkStyle =
    "text-[#00768e] hover:text-[#005f73] transition-colors duration-200 px-3 py-2 rounded-md text-sm lg:text-base";
  const activeLinkStyle = "font-semibold";

  const getNavLinkClass = ({ isActive }) => {
    return `${baseLinkStyle} ${isActive ? activeLinkStyle : ""}`;
  };

  const getMobileNavLinkClass = ({ isActive }) => {
    return `text-[#00768e] hover:bg-gray-100 transition-colors block py-3 w-full text-center ${
      isActive ? activeLinkStyle : ""
    }`;
  };

  return (
    <nav className="bg-white w-full px-4 md:px-6 py-3 flex items-center justify-between border-b border-gray-200 fixed top-0 left-0 z-50">
      <Link
        to="/"
        className="text-3xl md:text-4xl font-bold text-[#00768e] flex-shrink-0 mr-4"
      >
        JOBBER
      </Link>

      <div className="hidden md:flex items-center space-x-1 lg:space-x-2 relative">
        <NavLink className={getNavLinkClass} to="/job-listings">
          Manage Jobs
        </NavLink>
        <NavLink className={getNavLinkClass} to="/dashboard/company/create">
          Post New Job
        </NavLink>

        <button
          ref={profileButtonRef}
          onClick={toggleProfileDropdown}
          className={`${baseLinkStyle} focus:outline-none`}
          aria-haspopup="true"
          aria-expanded={isProfileDropdownOpen}
        >
          Profile
          <span className="ml-1 text-xs">
            {isProfileDropdownOpen ? "▲" : "▼"}
          </span>
        </button>

        {isProfileDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 top-full w-52 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
            role="menu"
            aria-orientation="vertical"
          >
            <Link
              to="/dashboard/company"
              className="block px-4 py-2 text-sm text-[#005f73] hover:bg-gray-100 w-full text-left"
              role="menuitem"
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              View
            </Link>
            <button
              onClick={handleLogout}
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              role="menuitem"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#00768e] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00768e]"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <span className="text-xl font-semibold leading-none">X</span>
          ) : (
            <span className="text-2xl font-semibold leading-none">☰</span>
          )}
        </button>
      </div>

      <div
        className={`absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg md:hidden ${
          isMobileMenuOpen ? "flex" : "hidden"
        } flex-col items-stretch py-4 space-y-1`}
      >
        <NavLink
          className={getMobileNavLinkClass}
          to="/job-listings"
          onClick={handleLinkClick}
        >
          Manage Jobs
        </NavLink>
        <NavLink
          className={getMobileNavLinkClass}
          to="/dashboard/company/create"
          onClick={handleLinkClick}
        >
          Post New Job
        </NavLink>
        <NavLink
          className={getMobileNavLinkClass}
          to="/dashboard/company"
          onClick={handleLinkClick}
        >
          Profile
        </NavLink>
        <div className="pt-3 px-4 border-t mt-2">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-150"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
