"use client";
import Loading from "@/components/loading";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

type Answer = {
  _id?: string;
  questionId: string;
  selectedAnswer: string;
};

type Attempt = {
  _id: string;
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  status: "in-progress" | "submitted";
  score?: number | null;
  answers: Answer[];
  __v: number;
};

const SubmissionPage = () => {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  // User
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
        if (!res.ok) {
          toast.error("Session expired. Please log in again.");
          router.push(`/login?callback=${encodeURIComponent(pathname)}`);
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

  const { id } = useParams();
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/submissions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch quiz submissions");
        const data = await res.json();
        console.log(data);
        setAttempts(data.attempts);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAttempts();
    }
  }, [id]);

  if (!user || loading) {
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
        <h1>There are no attempts yet.</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-[#6750cf] hover:bg-[#5038BC] cursor-pointer px-4 py-2 text-white m-4 rounded-xl font-normal text-lg "
        >
          Explore Quiz
        </button>
      </div>
    );

  return (
    <div className="p-10 min-h-screen w-full mx-auto text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">Quiz Submissions</h1>

      {attempts.length === 0 ? (
        <p className="text-gray-600 text-center">
          No submissions found for this quiz.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attempts.map((attempt) => {
            const isCompleted = attempt.status === "submitted";

            return (
              <div
                key={attempt._id}
                className="p-4 border rounded-lg shadow-md bg-white flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaUser className="text-gray-600" />
                  <p className="text-lg font-semibold">{attempt.userName}</p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {isCompleted ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaTimesCircle className="text-red-600" />
                  )}
                  <p>
                    {isCompleted ? `Score: ${attempt.score}` : "In Progress"}
                  </p>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <FaClock />
                    <p>
                      Started: {new Date(attempt.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/quiz/result/${attempt._id}`)}
                  disabled={!isCompleted}
                  className={`mt-4 w-full px-4 py-2 rounded-lg transition cursor-pointer ${
                    isCompleted
                      ? "bg-[#5038BC] text-white hover:bg-[#3c2a9d]"
                      : "bg-gray-400 text-gray-700 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <FaEye className="inline-block mr-2" /> View Attempt
                    </>
                  ) : (
                    <>
                      <FaEyeSlash className="inline-block mr-2" /> In Progress
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubmissionPage;
