"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdCalendarToday, MdCategory, MdDescription } from "react-icons/md";
import { FaClock, FaPlay, FaUser } from "react-icons/fa6";
import Loading from "@/components/loading";

type Quiz = {
  _id: string;
  title: string;
  description: string;
  category?: string[];
  timeLimit: number;
  coverImage?: string;
  creatorName: string;
  dateOpens?: string;
  dateCloses?: string;
};

const DetailPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/quiz/details/${id}`,
          {
            method: "GET",
          }
        );
        console.log(res.status);
        if (res.status === 403) setError("Access denied");

        const data = await res.json();
        if (data.quiz?.questions) delete data.quiz.questions;
        setQuiz(data.quiz);
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

    console.log(id);

    if (id) {
      console.log("wa");

      fetchQuiz();
    }
  }, [id]);

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

  return (
    <div className="p-6 min-h-screen px-6 md:px-16 bg-white shadow-lg  w-full">
      {/* Cover Image */}
      {quiz.coverImage && (
        <div
          className="w-full aspect-[16/5] bg-cover bg-center rounded-t-lg shadow-md"
          style={{ backgroundImage: `url(${quiz.coverImage})` }}
        ></div>
      )}

      <div className="p-6 text-left">
        {/* Quiz Title */}
        <h1 className="text-4xl font-extrabold text-[#5038BC]">{quiz.title}</h1>
        <p className="text-gray-600 text-sm flex items-center justify-start gap-2 mt-1">
          <FaUser className="text-[#5038BC]" /> Created by:{" "}
          <span className="font-medium">{quiz.creatorName}</span>
        </p>

        {/* Description */}
        {quiz.description && (
          <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-sm">
            <p className="flex items-center gap-2 text-gray-700">
              <MdDescription className="text-[#5038BC] text-lg" />
              {quiz.description}
            </p>
          </div>
        )}

        {/* Category & Time Limit */}
        <div className="mt-4 flex flex-wrap gap-3 justify-start">
          {quiz.category?.length ? (
            <span className="flex items-center gap-2 bg-[#5038BC] text-white px-3 py-1 rounded-lg text-sm">
              <MdCategory /> {quiz.category.join(", ")}
            </span>
          ) : (
            <></>
          )}
          {quiz.timeLimit && (
            <span className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm">
              <FaClock /> {quiz.timeLimit} min
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="mt-4 text-gray-700 text-sm space-y-2">
          {quiz.dateOpens && (
            <p className="flex items-center gap-2">
              <MdCalendarToday className="text-[#5038BC]" /> Opens:{" "}
              <span className="font-medium">
                {new Date(quiz.dateOpens).toLocaleDateString()}
              </span>
            </p>
          )}
          {quiz.dateCloses && (
            <p className="flex items-center gap-2">
              <MdCalendarToday className="text-[#FF5A5A]" /> Closes:{" "}
              <span className="font-medium">
                {new Date(quiz.dateCloses).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>

        {/* Start Button */}
        <div className="mt-6 flex justify-start">
          <button
            onClick={() => router.push(`start/${id}`)}
            className="flex items-center gap-2 cursor-pointer bg-[#5038BC] text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-[#4028a0] transition duration-300 transform hover:scale-105"
          >
            <FaPlay /> Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
