"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { FaArrowCircleLeft, FaArrowCircleRight, FaClock } from "react-icons/fa";

type Question = {
  _id: string;
  type: "multiple-choice" | "short-answer";
  questionText: string;
  options?: string[];
};

type Quiz = {
  _id: string;
  title: string;
  timeLimit: number;
  questions: Question[];
};

const StartQuizPage = () => {
  const pathname = usePathname();
  const { id } = useParams(); // Get quiz ID from URL
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
        toast.error("Something went wrong. Please try again later.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user || !id) return;

    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/quiz/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 404) throw new Error("Quiz not found");
        if (res.status === 403) throw new Error("Access denied");

        const data = await res.json();
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.timeLimit * 60); // Convert minutes to seconds
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, user]);

  // Start Attempt
  useEffect(() => {
    if (!user || !id) return;

    const startAttempt = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/start`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quizId: id }),
          }
        );

        if (!res.ok) throw new Error("Failed to start quiz attempt");

        const data = await res.json();
        sessionStorage.setItem("attemptId", data.attempt._id);
      } catch (err: any) {
        setError(err.message);
      }
    };

    startAttempt();
  }, [id, user]);

  // Save Attempt
  const handleAnswerSelect = async (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    try {
      const token = localStorage.getItem("token");
      const attemptId = sessionStorage.getItem("attemptId");

      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attemptId,
          questionId,
          selectedAnswer: answer,
        }),
      });
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  // Submit attempt
  const handleSubmitQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const attemptId = sessionStorage.getItem("attemptId");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ attemptId }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit quiz");

      toast.success("Quiz submitted successfully!");
      router.push(`/quiz/result/${id}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (loading) return <Loading />;
  if (error)
    return (
      <p className="min-h-screen text-red-500 flex justify-center items-center font-semibold">
        {error}
      </p>
    );
  if (!quiz)
    return (
      <p className="min-h-screen flex justify-center items-center font-semibold">
        Quiz not found.
      </p>
    );

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <div className=" md:fixed top-20 md:top-0 left-0  z-40 flex flex-col sm:flex-row md:flex-col justify-around p-6 pt-12 w-full md:w-70  md:p-6">
        <div>
          <h1 className="text-xl font-bold text-[#5038BC]">{quiz.title}</h1>

          {/* Timer */}
          <div className="flex items-center gap-2 text-red-500 font-bold text-lg mt-2">
            <FaClock />
            Time Left: {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-lg mb-4 mt-4 sm:mt-0">Questions</h2>
          <div className="grid grid-cols-7 sm:grid-cols-8 md:grid-cols-6 gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`sm:p-2 text-center border rounded-lg cursor-pointer ${
                  index === currentQuestionIndex
                    ? "bg-[#5038BC] text-white"
                    : "bg-white"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmitQuiz}
            className="w-fit bg-red-500 text-white p-2 mt-4 rounded-lg"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-grow p-6 md:p-20 mt-0 md:mt-20">
        {/* Current Question */}
        <h1 className="mt-5 font-semibold text-2xl">{`Question: ${
          currentQuestionIndex + 1
        }`}</h1>
        <div className="mt-6 p-4 border rounded-lg shadow-sm">
          <p className="font-semibold">{currentQuestion.questionText}</p>

          {currentQuestion.type === "multiple-choice" && (
            <div className="mt-2 space-y-2">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    handleAnswerSelect(currentQuestion._id, option)
                  }
                  className={`block w-full text-left p-2 border rounded ${
                    answers[currentQuestion._id] === option
                      ? "bg-[#5038BC] text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "short-answer" && (
            <input
              type="text"
              className="border p-2 rounded w-full mt-2"
              placeholder="Type your answer here..."
              value={answers[currentQuestion._id] || ""}
              onChange={(e) =>
                handleAnswerSelect(currentQuestion._id, e.target.value)
              }
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
            }
            className="p-2 border rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            <FaArrowCircleLeft />
          </button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-400 cursor-pointer"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(prev + 1, quiz.questions.length - 1)
                )
              }
              className="p-2 border rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              <FaArrowCircleRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartQuizPage;
