"use client";
import React from "react";
import { Link } from "react-router-dom";
import Header from "../Home/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4">
        <div className="max-w-2xl mx-auto text-center pt-16 pb-10">
          <div>
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent leading-none">
              404
            </h1>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
              The page you're looking for seems to have wandered off campus.
              Don't worry, our Campus Query Bot can help you find what you need!
            </p>
          </div>
          <div className="mb-8">
            <div className="w-18 h-18 mx-auto bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-6">
              <div className="text-6xl">🏫</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/home"
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-full hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </Link>

           
          </div>
        </div>
      </div>
    </>
  );
}
