import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, KeyRound, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import mnsuamLogo from "../../assets/logo-MNSUAM.jpg";

export default function Header() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleChangePassword = () => {
    toast("Redirecting to change password...");
    navigate("/change-password");
  };

  let userName = "";
  let userEmail = "";
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userName = parsedUser.name || "";
      userEmail = parsedUser.email || "";
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
    }
  }

  return (
    <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo + Title */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <img
                src={mnsuamLogo || "/placeholder.svg"}
                alt="MNSUAM Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <div className="ml-3 lg:ml-4">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Ask MNSUAM
              </span>
              <p className="hidden sm:block text-xs lg:text-sm text-slate-500 font-medium">
                Your Academic Assistant
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/agents")}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 text-sm lg:text-base cursor-pointer"
                >
                  My Agents
                </button>

                {/* Account Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className={` cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200 font-medium shadow-sm text-sm lg:text-base ${
                      isDropdownOpen
                        ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                        : "border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Account</span>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                              {userName || "Guest User"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {userEmail || "No email found"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            handleChangePassword();
                            setIsDropdownOpen(false);
                          }}
                          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                        >
                          <KeyRound className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">
                            Change Password
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="px-6 py-2.5 rounded-full border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-200 text-sm lg:text-base"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-6 space-y-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/agents");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg text-center"
                  >
                    My Agents
                  </button>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                          {userName || "Guest User"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {userEmail || "No email found"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => {
                          handleChangePassword();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-150"
                      >
                        <KeyRound className="w-5 h-5 text-slate-500" />
                        <span className="font-medium">Change Password</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 rounded-xl border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-200 text-center"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
