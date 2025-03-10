"use client";
import Loading from "@/components/loading";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrophy, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaCircleLeft } from "react-icons/fa6";
import { HiPresentationChartBar } from "react-icons/hi2";

type Question = {
  _id: string;
  type: "multiple-choice" | "short-answer";
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
};

type Quiz = {
  _id: string;
  title: string;
  timeLimit: number;
  questions: Question[];
  createdBy: string;
  creatorName: string;
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
  startTime: string;
  endTime?: string;
  status: "in-progress" | "submitted";
  score?: number | null;
  answers: Answer[];
  __v: number;
};

const ResultPage = () => {
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
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [attemptor, setAttemptor] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) throw new Error("User not authenticated");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 403) {
          throw new Error("Unauthorized");
        }
        if (!res.ok)
          throw new Error(
            "Failed to fetch attempt data: Try to log out and log in"
          );

        const data = await res.json();
        setAttempt(data.attempt);
        setQuiz(data.attemptedQuiz);
        setAttemptor(data.attemptorName);
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
      fetchAttempt();
    }
  }, [id]);

  if (loading || !user) return <Loading />;
  if (error)
    return (
      <p className="min-h-screen w-full flex justify-center items-center text-center text-red-500">
        {error}
      </p>
    );

  return (
    <div className="min-h-screen w-full p-10 text-black">
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-6 text-center">
        <FaCircleLeft
          onClick={() => router.push("/profile")}
          className="text-[#5038BC] hover:opacity-75 cursor-pointer"
        />
        Quiz Results
      </h1>

      {attempt && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
          <h2 className="text-xl font-bold flex justify-center items-center gap-2">
            <FaTrophy className="text-[#5038BC]" /> Score: {attempt.score}
          </h2>
          <p className="text-gray-600 mt-2">
            You answered {attempt.answers.length}/{quiz?.questions.length}{" "}
            questions.
          </p>
        </div>
      )}

      {quiz && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">{quiz.title}</h2>
          <p className="text-gray-500">Created by: {quiz.creatorName}</p>
          <p className="text-gray-500">Attempt by: {attemptor}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quiz?.questions.map((question, i) => {
          const userAnswer = attempt?.answers.find(
            (ans) => ans.questionId === question._id
          );
          const isCorrect =
            userAnswer?.selectedAnswer === question.correctAnswer;

          return (
            <div
              key={question._id}
              className="p-6 border rounded-lg shadow-md bg-white flex flex-col justify-between"
            >
              <h2 className="font-semibold text-[#5038BC]">
                Questions: {i + 1}
              </h2>
              <div className="w-full h-[1.5px] bg-gray-200 my-2"></div>
              <p className="font-semibold">{question.questionText}</p>

              <div
                className={`flex items-center gap-2 mt-2 ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
                <span>
                  Your Answer: {userAnswer?.selectedAnswer || "No answer"}
                </span>
              </div>

              <p className=" mt-1 ">Correct Answer: {question.correctAnswer}</p>

              {question.explanation && (
                <div className=" bg-green-50  px-4 py-3 rounded-2xl my-2">
                  <h2 className="flex text-[#5038BC] items-center gap-2 my-2">
                    <HiPresentationChartBar />
                    Explanation
                  </h2>
                  <p className="mt-2 text-gray-700">
                    <strong>Explanaation:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => router.push("/")}
        className="bg-[#5038BC] text-xl text-white px-4 py-2 rounded-xl cursor-pointer my-8 hover:opacity-75"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ResultPage;
