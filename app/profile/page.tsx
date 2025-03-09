"use client";

import Loading from "@/components/loading";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaListAlt, FaClipboardList } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

type User = {
  _id: string;
  name: string;
  email: string;
};

const ProfilePage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.dismiss();
        toast.error("You need to log in first.");
        router.push(`/login?callback=${encodeURIComponent(pathname)}`);
        return;
      }

      const cachedUser = sessionStorage.getItem("user");
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 401) {
          toast.dismiss();
          toast.error("Session expired. Please log in again.");
          router.push(`/login?callback=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!res.ok) {
          toast.error("Failed to fetch user data. Please try again.");
          return;
        }

        const data = await res.json();
        setUser(data.user);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        console.error("Error:", error);
        toast.error("Something went wrong. Please try again later.");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    sessionStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
    router.push("/");
  };

  return (
    <>
      {user ? (
        <div className="min-h-screen flex items-center justify-center bg-purple-50 p-6">
          <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center relative">
            {/* Profile Header with Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-[#5038bc] text-white flex items-center justify-center text-4xl font-bold rounded-full shadow-md">
                {user.name[0] + user.name.split(" ")[1][0]}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mt-4">
                {user.name}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              <button
                className="flex items-center justify-center gap-3  bg-[#333333] hover:opacity-75 cursor-pointer text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md"
                onClick={() => router.push("/profile/attempts")}
              >
                <FaListAlt className="text-lg" />
                View Your Attempts
              </button>

              <button
                className="flex items-center justify-center gap-3 bg-[#5038bc] hover:opacity-75 cursor-pointer text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md"
                onClick={() => router.push("/profile/quizzes")}
              >
                <FaClipboardList className="text-lg" />
                View Your Quizzes
              </button>
            </div>

            {/* Logout Button */}
            <button
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all shadow-md"
              onClick={handleLogout}
            >
              <FiLogOut className="text-xl" />
            </button>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default ProfilePage;
