"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
};

export default function LoginPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
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
          return;
        }

        if (!res.ok) {
          return;
        }

        router.push("/profile");
      } catch (error) {}
    };

    fetchUser();
  }, []);
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback") || pathname; // Default to current page

  const handleLogin = () => {
    try {
      const googleAuthUrl = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
      );
      googleAuthUrl.searchParams.set("state", callback); // Store callback in `state`
      window.location.href = googleAuthUrl.toString();
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="p-4 text-black flex flex-col lg:flex-row items-center justify-center min-h-screen">
      <Image
        src="/happy.png"
        alt="Happy Image"
        width={256}
        height={256}
        className="select-none "
      />
      <div className="flex flex-col justify-center items-center gap-10">
        <h1 className="font-semibold text-center  text-lg lg:text-2xl">
          Log in to explore more of <span className="font-bold">Susun</span>
          <span className="font-bold text-[#5038BC]">Soal</span>
        </h1>
        <button
          onClick={handleLogin}
          className="bg-[#5038BC] w-fit flex cursor-pointer transition-all hover:opacity-75 justify-center  items-center gap-2 lg:gap-5 font-bold text-white px-2 lg:px-4 py-3 lg:py-5 rounded fontOutfit text-md lg:text-xl"
        >
          <FaGoogle className="text-md lg:text-xl" />
          Google Log In
        </button>
      </div>
    </div>
  );
}
