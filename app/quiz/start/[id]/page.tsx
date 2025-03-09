"use client";
import { useEffect, useRef, useState } from "react";
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

type Answer = {
  _id?: string;
  questionId: string;
  selectedAnswer: string;
};

type Attempt = {
  _id: string;
  quizId: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  status: "in-progress" | "submitted";
  score?: number | null;
  answers: Answer[];
  __v: number;
};

const StartQuizPage = () => {
  const pathname = usePathname();
  const { id } = useParams(); // Get quiz ID from URL
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const useDebounce = <T,>(value: T, delay: number = 2000): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  };

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, user]);

  useEffect(() => {
    console.log(user);
    if (!user) return;
    const fetchAttempt = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/quiz/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data: Attempt = await res.json();
          console.log("exist:", data);
          setAttempt(data);
        } else {
          // Start a new attempt if not found
          console.log("new");
          const newRes = await fetch(
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

          if (newRes.ok) {
            const newData: Attempt = await newRes.json();
            setAttempt(newData);
          }
        }
      } catch (error) {
        console.log("aa");
        console.error("Error fetching attempt:", error);
      }
    };

    fetchAttempt();
    console.log(attempt);
  }, [user]);

  // Save Answer
  const handleAnswerSelect = async (questionId: string, answer: string) => {
    try {
      const token = localStorage.getItem("token");
      const attemptId = attempt?._id;
      console.log(attempt);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/attempt/save`,
        {
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
        }
      );
      console.log(res);
      if (!res.ok) throw new Error("Failed to save answer");
      console.log("Set", questionId, answer);
      setAttempt((prev) => {
        if (!prev) return prev;

        // Create a new answers array
        const updatedAnswers = prev.answers.map((ans) =>
          ans.questionId === questionId
            ? { ...ans, selectedAnswer: answer }
            : ans
        );

        // If the answer doesn't exist, add it
        const answerExists = prev.answers.some(
          (ans) => ans.questionId === questionId
        );
        const newAnswers = answerExists
          ? updatedAnswers
          : [...updatedAnswers, { questionId, selectedAnswer: answer }];

        return { ...prev, answers: newAnswers };
      });

      console.log(attempt);
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const [submitting, setSubmitting] = useState(false);
  // Submit Attempt
  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const attemptId = attempt?._id;

      await new Promise((resolve) => setTimeout(resolve, 2000));

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
      router.push(`/quiz/result/${attemptId}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!attempt?.endTime) return;

    const updateTimer = () => {
      if (!attempt.endTime) return;

      const now = new Date().getTime();
      const endTime = new Date(attempt.endTime).getTime();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      // console.log(diff);
      if (diff <= 0) {
        router.push(`/quiz/result/${attempt?._id}`);
      }
      setTimeLeft(diff);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [attempt?.endTime]);

  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const lastSubmittedValues = useRef<{ [key: string]: string }>({});
  const debouncedValues = useDebounce(inputValues, 2000);

  useEffect(() => {
    if (attempt && Array.isArray(attempt.answers)) {
      const initialValues: { [key: string]: string } = {};
      attempt.answers.forEach((ans) => {
        initialValues[ans.questionId] = ans.selectedAnswer || "";
      });
      setInputValues(initialValues);
    }
  }, [attempt]);

  useEffect(() => {
    Object.entries(debouncedValues).forEach(([questionId, answer]) => {
      if (
        answer !== undefined &&
        lastSubmittedValues.current[questionId] !== answer
      ) {
        handleAnswerSelect(questionId, answer);
        lastSubmittedValues.current[questionId] = answer;
      }
    });
  }, [debouncedValues]);

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
            Time Left:{" "}
            {timeLeft !== null
              ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                  .toString()
                  .padStart(2, "0")}`
              : "N/A"}
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
            disabled={submitting}
            onClick={handleSubmitQuiz}
            className="w-fit bg-red-500 text-white p-2 mt-4 rounded-lg"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
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
                    setInputValues((prev) => ({
                      ...prev,
                      [currentQuestion._id]: option,
                    }))
                  }
                  className={`block w-full text-left p-2 border rounded ${
                    inputValues[currentQuestion._id] === option
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
              value={inputValues[currentQuestion._id] ?? ""}
              onChange={(e) =>
                setInputValues((prev) => ({
                  ...prev,
                  [currentQuestion._id]: e.target.value,
                }))
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
              disabled={submitting}
              onClick={handleSubmitQuiz}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-400 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
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
