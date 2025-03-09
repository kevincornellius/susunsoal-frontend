"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast, { CheckmarkIcon } from "react-hot-toast";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import Loading from "@/components/loading";
import { RiDraftFill } from "react-icons/ri";
import { MdPublish } from "react-icons/md";
import { BiCheck } from "react-icons/bi";

type Quiz = {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  published: boolean;
  attemptCount: number;
};

type User = {
  _id: string;
  name: string;
  email: string;
};

const MyQuizList = () => {
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

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMyQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/quiz/my-quizzes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) toast.error("Failed to fetch quizzes");
        const data = await res.json();
        setQuizzes(data.quizzes);
      } catch (err) {
        setError("Failed to load your quizzes. Please try again later.");
      } finally {
        setFetching(false);
      }
    };

    fetchMyQuizzes();
  }, [user]);

  const handleDelete = async (quizId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quiz?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/quiz/delete/${quizId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete quiz");

      toast.success("Quiz deleted successfully!");
      setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
    } catch (err) {
      toast.error("Error deleting quiz. Please try again.");
    }
  };

  if (!user || fetching) {
    return <Loading />;
  }

  if (error)
    return (
      <p className="font-bold text-center min-h-screen w-full flex justify-center items-center text-red-500">
        {error}
      </p>
    );
  if (quizzes.length === 0)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center font-semibold text-center text-black text-2xl">
        <h1>You have not created any quizzes yet.</h1>
        <button
          onClick={() => router.push("/create")}
          className="bg-[#6750cf] hover:bg-[#5038BC] cursor-pointer px-4 py-2 text-white m-4 rounded-xl font-normal text-lg "
        >
          Create Quiz
        </button>
      </div>
    );

  return (
    <div className="min-h-screen mx-auto p-12">
      <h2 className="text-3xl font-bold  text-gray-800 mb-6">
        Your Created Quizzes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-white border-2 border-gray-400 flex w-full flex-col justify-between shadow-lg rounded-lg p-2 transition hover:shadow-xl relative"
          >
            {/* Cover Image */}
            <div
              className="rounded-md"
              style={{
                backgroundImage: quiz.coverImage
                  ? `url(${quiz.coverImage})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                aspectRatio: "16 / 5",
              }}
            ></div>

            {/* Quiz Details */}
            <div className="mt-2 p-2">
              <h3 className="text-xl font-bold text-[#333333] truncate">
                {quiz.title}
              </h3>
              <p className="text-gray-600 text-sm truncate">
                {quiz.description}
              </p>
              <div className="w-full h-px my-3 bg-gray-400"></div>

              {/* Publish Status */}
              <p
                className={`text-sm mt-2 flex items-center gap-2 font-semibold ${
                  quiz.published ? "text-green-600" : "text-red-500"
                }`}
              >
                {quiz.attemptCount > 0 ? (
                  <BiCheck />
                ) : quiz.published ? (
                  <MdPublish />
                ) : (
                  <RiDraftFill />
                )}
                {quiz.attemptCount > 0
                  ? "Attempted"
                  : quiz.published
                  ? "Published"
                  : "Draft"}
              </p>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                {quiz.attemptCount > 0 ? (
                  <button
                    className="flex cursor-pointer items-center gap-2 bg-[#6750cf] hover:bg-[#5038BC] text-white px-2 py-2 rounded-md w-full transition"
                    onClick={() => router.push(`/quiz/submissions/${quiz._id}`)}
                  >
                    <FaEye />
                    View Submissions
                  </button>
                ) : (
                  <>
                    <button
                      className="flex cursor-pointer items-center gap-2 bg-[#6750cf] hover:bg-[#5038BC] text-white px-2 py-2 rounded-md w-full transition"
                      onClick={() => router.push(`/quiz/edit/${quiz._id}`)}
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      className="flex cursor-pointer items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md w-full transition"
                      onClick={() => handleDelete(quiz._id)}
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyQuizList;
