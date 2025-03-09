"use client";
import Loading from "@/components/loading";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaClock, FaChartBar } from "react-icons/fa";

type User = {
  _id: string;
  name: string;
  email: string;
};

type Answer = {
  _id?: string;
  questionId: string;
  selectedAnswer: string;
};

type Attempt = {
  _id: string;
  quizId: string;
  userId: string;
  quizTitle: string;
  startTime: string;
  endTime?: string;
  status: "in-progress" | "submitted";
  score?: number | null;
  answers: Answer[];
  __v: number;
};

const AttemptsProfilePage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
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
        toast.error("Something went wrong. Please try again later.");
      }
    };

    fetchUser();
  }, []);

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token);
        if (!token) throw new Error("User not authenticated");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/my-attempts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch attempts");

        const data = await res.json();
        setAttempts(data.attempts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  if (!user) {
    return <Loading />;
  }

  if (error)
    return (
      <p className="font-bold text-center min-h-screen w-full flex justify-center items-center text-red-500">
        {error}
      </p>
    );
  if (attempts.length === 0)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center font-semibold text-center text-black text-2xl">
        <h1>You have not Attempted any quiz yet.</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-[#6750cf] hover:bg-[v] cursor-pointer px-4 py-2 text-white m-4 rounded-xl font-normal text-lg "
        >
          Explore Quiz
        </button>
      </div>
    );

  return (
    <div className="p-10 min-h-screen mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Quiz Attempts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attempts.map((attempt) => (
          <div
            key={attempt._id}
            className="p-4 border rounded-lg shadow-md bg-white"
          >
            <h1 className="font-semibold text-[#5038BC] text-2xl">
              {attempt.quizTitle}
            </h1>
            <div className="w-full h-[1.5px] bg-gray-200 my-2"></div>
            {/* Status */}
            <div className="flex items-center gap-2 text-lg font-semibold">
              {attempt.status === "submitted" ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaClock className="text-yellow-500" />
              )}
              <span>
                {attempt.status === "submitted" ? "Completed" : "In Progress"}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 text-gray-700 mt-2">
              <FaChartBar className="text-blue-500" />
              <span>Score: {attempt.score ?? "N/A"}</span>
            </div>

            {/* Start Time */}
            <div className="flex items-center gap-2 text-gray-700 mt-2">
              <FaClock className="text-gray-500" />
              <span>{new Date(attempt.startTime).toLocaleString()}</span>
            </div>

            {/* View Result Button */}
            {attempt.status === "submitted" ? (
              <button
                onClick={() => router.push(`/quiz/result/${attempt._id}`)}
                className="mt-4 w-full bg-[#5038BC] text-white p-2 rounded-lg hover:bg-[#3c2a9d] transition"
              >
                View Result
              </button>
            ) : (
              <button
                onClick={() => router.push(`/quiz/start/${attempt.quizId}`)}
                className="mt-4 w-full bg-[#5038BC] text-white p-2 rounded-lg hover:bg-[#3c2a9d] transition"
              >
                Go to Quiz
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttemptsProfilePage;
