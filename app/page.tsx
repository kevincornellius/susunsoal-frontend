"use client";
import Loading from "@/components/loading";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaAngleDoubleRight,
  FaArrowLeft,
  FaArrowRight,
  FaUser,
} from "react-icons/fa";
import { MdAccessTimeFilled } from "react-icons/md";
import { TbStackBack } from "react-icons/tb";
import debounce from "lodash.debounce";

import { TiCancel } from "react-icons/ti";

type Quiz = {
  _id: string;
  title: string;
  category?: string[];
  timeLimit: number;
  coverImage: string;
  creatorName: string;
};

const categories = [
  "General",
  "Science",
  "History",
  "Math",
  "Entertainment",
  "Sports",
  "Literature",
  "Personality",
  "Business",
  "Movies",
  "Music",
  "Trivia",
];
const HomePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract values from URL parameters
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchQuizzes = async (searchQuery = "", category = "", pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery || "",
        category: category || "",
        page: pageNum.toString(),
        limit: "6",
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/quiz/all?${params}`
      );

      if (!res.ok) throw new Error("Failed to fetch quizzes");

      const data = await res.json();
      setQuizzes(data.quizzes || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchQuizzes = useCallback(
    debounce((query: string, category: string, pageNum: number) => {
      fetchQuizzes(query, category, pageNum);
    }, 500),
    []
  );

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);

    if (search) {
      currentParams.set("search", search);
    } else {
      currentParams.delete("search");
    }

    if (selectedCategory) {
      currentParams.set("category", selectedCategory);
    } else {
      currentParams.delete("category");
    }

    router.replace(`${window.location.pathname}?${currentParams.toString()}`);
  }, [search, selectedCategory]);

  useEffect(() => {
    debouncedFetchQuizzes(search, selectedCategory, page);
  }, [search, selectedCategory, page]);

  const clearSearch = () => {
    setSearch("");
    setSelectedCategory("");
    router.replace(window.location.pathname);
  };

  // Nav

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < lastScrollY) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className=" text-black min-h-screen w-full">
      {/* Search and Category Filters */}
      <div
        className={`fixed top-[10vh] md:top-0 left-0 md:left-70 w-full md:w-[calc(100%-70px)] p-5 bg-white bg-opacity-75 shadow-md flex flex-col md:flex-row gap-4 items-center z-40 transition-all duration-300 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* Search Input Section */}
        <div className="relative w-full md:w-[50%] flex items-center">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="border border-gray-400 px-4 py-2 rounded-lg w-full pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <TiCancel
              className="absolute right-3 text-[#5038BC] text-2xl cursor-pointer hover:opacity-75"
              onClick={() => clearSearch()}
            />
          )}
        </div>

        {/* Category Dropdown */}
        <select
          className="border border-gray-400 px-4 py-2 rounded-lg w-full md:w-auto"
          value={selectedCategory || ""}
          onChange={(e) => {
            setSelectedCategory(e.target.value || "");
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 md:p-16">
        {/* Hero Section */}
        <div
          className="w-full aspect-[4/1] rounded-md flex flex-col justify-center px-[5vw] py-[2vh] mt-40 md:mt-16 my-12"
          style={{
            backgroundImage: "url(/menu.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h1 className="text-white font-bold text-[4vw] md:text-[2.7vw] lg:text-[2.5vw] text-start">
            Make It, Play It, Share It
          </h1>
          <h1 className="flex items-center font-semibold gap-2 w-fit text-[#5038BC] bg-white px-[2vw] py-[0.5vw] my-2 rounded-2xl text-[2.5vw] md:text-[1vw]">
            Only on SusunSoal{" "}
            <TbStackBack className="text-[2.5vw] md:text-[2vw] lg:text-[1.5vw]" />
          </h1>
        </div>

        {/* Recent Quizzes Section */}
        <div className="font-semibold text-lg md:text-2xl flex items-center gap-3 justify-center my-4 bg-[#5038BC] text-white px-3 py-2 w-fit rounded-2xl">
          {selectedCategory ? (
            <>
              <h1>{selectedCategory} Quizzes</h1>
              <span
                className="text-red-400 hover:text-red-500 cursor-pointer"
                onClick={() => setSelectedCategory("")}
              >
                <TiCancel />{" "}
              </span>
            </>
          ) : (
            <h1>Recent Quizzes</h1>
          )}
        </div>
        {loading || !quizzes ? (
          <Loading />
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white border-2  border-gray-400 flex flex-col h-full shadow-lg rounded-lg p-2 transition hover:shadow-xl "
              >
                {/* Cover Image */}
                <div
                  className="rounded-md aspect-[16/5] bg-cover bg-center"
                  style={{
                    backgroundImage: quiz.coverImage
                      ? `url(${quiz.coverImage})`
                      : "none",
                  }}
                ></div>

                <div className="flex flex-col flex-grow mt-2 p-2">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#333333] truncate">
                    {quiz.title}
                  </h3>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {quiz.category?.map((ctg) => (
                      <button
                        key={ctg}
                        className="bg-[#6750cf] hover:bg-[#5038BC] text-white px-3 rounded-lg text-sm cursor-pointer"
                        onClick={() => setSelectedCategory(ctg)}
                      >
                        {ctg}
                      </button>
                    ))}
                  </div>

                  <div className="flex-grow"></div>

                  {/* Quiz Details */}
                  <div className="mt-2">
                    <h2 className="text-sm flex items-center gap-2">
                      <MdAccessTimeFilled className="text-[#5038bc]" />
                      {quiz.timeLimit} minutes
                    </h2>
                    <h2 className="text-sm flex items-center gap-2">
                      <FaUser className="text-[#5038bc]" />
                      By {quiz.creatorName}
                    </h2>
                  </div>

                  {/* Detail */}
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(`/quiz/${quiz._id}`)}
                      className="w-full cursor-pointer bg-[#5038BC] text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#3f2ea1] transition"
                    >
                      See Details <FaAngleDoubleRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No quizzes found.</p>
        )}

        <div className="mt-10 flex justify-center items-center gap-3">
          <button
            className="px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-200"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <FaArrowLeft />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-200"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
