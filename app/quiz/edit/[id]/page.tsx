"use client";
import toast from "react-hot-toast";

import Loading from "@/components/loading";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { TbLayoutListFilled, TbMessageFilled } from "react-icons/tb";
import { IoMdImage } from "react-icons/io";
import { BiSolidCategory, BiSolidSelectMultiple } from "react-icons/bi";
import { TiCancel } from "react-icons/ti";
import {
  MdAccessTimeFilled,
  MdOutlineShortText,
  MdPublish,
} from "react-icons/md";
import { FaCircleQuestion, FaPlus } from "react-icons/fa6";
import { AiFillCheckCircle } from "react-icons/ai";
import { HiPresentationChartLine } from "react-icons/hi2";
import { FaCalendarTimes, FaSave } from "react-icons/fa";

type Question = {
  type: "multiple-choice" | "short-answer";
  questionText: string;
  options?: string[]; // Only used for multiple-choice
  correctAnswer: string;
  explanation?: string;
};

type Quiz = {
  title: string;
  description: string;
  category: string[];
  coverImage: string;
  questions: Question[];
  timeLimit?: number;
  maxAttemptsPerUser?: number;
  tags?: string[];
  totalScore: number;
  dateOpens: string; // Store as ISO string for easy conversion to Date
  dateCloses: string;
  published: boolean;
};

const backgroundImages = [
  "/purple.png",
  "/sit.png",
  "/happy.png",
  "https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg",
  "https://img.freepik.com/free-vector/learning-concept-illustration_114360-3454.jpg",
  "https://img.freepik.com/free-vector/gradient-background-knowledge-day-celebration_23-2150665651.jpg",
  "https://static.vecteezy.com/system/resources/thumbnails/003/501/025/small/distance-learning-icons-composition-vector.jpg",
  "https://static.vecteezy.com/system/resources/previews/003/112/374/non_2x/online-learning-with-teacher-free-vector.jpg",
];

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

const EditPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { id } = useParams();

  const formatDateForInput = (isoString: string) => {
    const date = new Date(isoString);

    return date.toISOString().slice(0, 16);
  };

  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    category: [],
    coverImage: "/purple.png",
    questions: [
      {
        type: "multiple-choice",
        questionText: "",
        options: ["Option 1", "Option 2"],
        correctAnswer: "",
        explanation: "",
      },
    ],
    totalScore: 0,
    timeLimit: 120,
    dateOpens: formatDateForInput(new Date().toISOString()), // Default to now
    dateCloses: formatDateForInput(
      new Date(2045, 10, 11, 18, 11, 11).toISOString()
    ),
    published: false, // Default to draft
  });

  useEffect(() => {
    if (!id) return;

    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/quiz/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(res);
        if (res.status === 401) {
          router.push(`/login?callback=${encodeURIComponent(pathname)}`);
        }
        if (res.status === 403) {
          toast.error("Unauthourized");
        }
        // TODO
        if (!res.ok) toast.error("Failed to fetch quiz");

        const data = await res.json();
        setQuiz(data.quiz);
      } catch (err) {
        toast.error("Quiz not found or an error occurred.");
      } finally {
      }
    };

    fetchQuiz();
  }, [id]);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Ref for dropdown
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const togglePublish = () => {
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      published: !prevQuiz.published, // Toggle publish state
    }));
  };

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          type: "multiple-choice",
          questionText: "",
          options: ["Option 1", "Option 2"],
          correctAnswer: "",
          explanation: "",
        },
      ],
    }));
  };

  const updateQuestion = (index: number, newQuestion: Question) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = newQuestion;
      return { ...prev, questions: updatedQuestions };
    });
  };
  const addOption = (index: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === index
          ? {
              ...question,
              options: [...(question.options || []), `New Option`], // New array
            }
          : question
      ),
    }));
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];

      if (!updatedQuestions[qIndex].options) return prev;

      const newOptions = [...updatedQuestions[qIndex].options];

      if (newOptions.length <= 2) {
        toast.dismiss();
        toast.error("A question must have at least 2 options");
        return { ...prev };
      }

      newOptions.splice(optIndex, 1);
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        options: newOptions,
      };

      return { ...prev, questions: updatedQuestions };
    });
  };

  const removeQuestion = (index: number) => {
    if (quiz.questions.length <= 1) {
      toast.dismiss();
      toast.error("Quiz must have at least one question");

      return;
    }
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  // Category

  const addCategory = (category: string) => {
    if (!quiz.category.includes(category) && quiz.category.length < 5) {
      setQuiz({ ...quiz, category: [...quiz.category, category] });
    }
    setShowDropdown(false); // Close dropdown after selecting
  };

  const removeCategory = (categoryToRemove: string) => {
    setQuiz({
      ...quiz,
      category: quiz.category.filter((cat) => cat !== categoryToRemove),
    });
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const validateQuiz = (quiz: Quiz) => {
    toast.dismiss();
    if (!quiz.title.trim()) {
      toast.error("Quiz title is required!");
      return false;
    }

    if (!quiz.timeLimit || quiz.timeLimit < 1) {
      toast.error("Time limit must be at least 1 minute!");
      return false;
    }

    if (!quiz.dateOpens || !quiz.dateCloses) {
      toast.error("Quiz must have both an opening and closing date!");
      return false;
    }

    if (new Date(quiz.dateOpens) >= new Date(quiz.dateCloses)) {
      toast.error("Quiz closing date must be after opening date!");
      return false;
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      toast.error("Quiz must have at least one question!");
      return false;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];

      if (!question.questionText.trim()) {
        toast.error(`Question ${i + 1} must have text!`);
        return false;
      }

      if (question.type === "multiple-choice") {
        if (!question.options || question.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options!`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSaveQuiz = async () => {
    if (!validateQuiz(quiz)) return;

    try {
      const token = localStorage.getItem("token"); // Get the auth token

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/quiz/edit/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Authing
          },
          body: JSON.stringify(quiz),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save quiz");
      } else {
        toast.success("Quiz saved successfully!");
      }
    } catch (error) {
      toast.error("Server error, try again later");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {quiz && (
        <div className="min-h-screen text-black px-3 lg:px-[10vw] py-20 ">
          <h1 className="font-bold text-3xl pb-5"> Create Quiz</h1>
          {/* Background Container */}
          <div
            className="w-full rounded-t-2xl flex px-2 justify-between items-end relative"
            style={{
              backgroundImage: quiz.coverImage
                ? `url(${quiz.coverImage})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              aspectRatio: "16 / 5",
            }}
          >
            <div className="bg-[#333333] p-4 ml-2 md:ml-10 -mb-6 rounded-xl border-4 border-[#fafafa]">
              <TbMessageFilled className="text-xl md:text-3xl text-white" />
            </div>
            <div className="relative w-full flex justify-end items-center">
              {/* Change Cover Button*/}
              <button
                className="flex bg-[#fafafa] px-2 md:px-3 md:py-2 fontOutfit rounded shadow items-center gap-2 transition-all m-2 hover:opacity-75 cursor-pointer"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <IoMdImage /> Change Cover
              </button>

              {/* Image Select */}

              <div
                ref={menuRef}
                className={`absolute top-full right-0 mt-2 z-30 bg-white p-5 rounded-lg shadow-lg 
                 max-w-[99%] w-[300px] sm:w-[400px] transition-all opacity-100 translate-y-0 scale-0 ${
                   isMenuOpen ? "scale-100" : ""
                 }`}
              >
                <h2 className="text-lg font-bold mb-4">Select a Cover Image</h2>

                {/* Image Grid */}
                <div className=" grid grid-cols-2 sm:grid-cols-4 gap-3 items-center place-items-center ">
                  {backgroundImages.map((image) => (
                    <button
                      key={image}
                      onClick={() => {
                        setQuiz({ ...quiz, coverImage: image });
                        setIsMenuOpen(false);
                      }}
                      className="border rounded w-fit overflow-hidden hover:opacity-75 focus:outline-none"
                    >
                      <img
                        src={`${image}`}
                        alt={image}
                        className="w-12 sm:w-16 h-12 sm:h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  className="mt-4 px-4 py-2 bg-gray-500 text-white rounded w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-10 p-4 justify-start">
            <input
              type="text"
              placeholder="Quiz Title"
              className="w-full font-semibold fontOutfit text-3xl p-2 mb-5 border-b-2 border-gray-400 focus:border-[#5038BC] focus:outline-none transition-all "
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            />

            <h2
              className="w-fit gap-2 text-lg flex justify-center items-center font-semibold cursor-pointer"
              onClick={toggleDropdown}
            >
              <BiSolidCategory className="text-[#5038bc]" />
              Select Category
            </h2>

            {/* Selected Categories */}

            <div className="flex flex-wrap gap-2">
              {quiz.category.map((cat) => (
                <span
                  key={cat}
                  className="bg-[#5038bc] font-semibold text-white px-2 py-1 rounded flex items-center"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="ml-2 transition-all text-white hover:text-red-400 font-bold cursor-pointer"
                  >
                    <TiCancel />
                  </button>
                </span>
              ))}
            </div>

            {/* Dropdown Menu (Replaces Select) */}

            <div
              ref={dropdownRef}
              className={`absolute top-1/2 left-2/5 transition-all   ${
                showDropdown ? "scale-100" : "scale-0"
              } w-fit flex flex-col p-4 bg-white shadow-lg rounded   mt-1 z-10`}
            >
              <h2 className="font-bold ">Select Category</h2>
              {categories
                .filter((category) => !quiz.category.includes(category))
                .map((category) => (
                  <div
                    key={category}
                    className="p-2 hover:bg-gray-100 rounded-2xl  fontOutfit cursor-pointer"
                    onClick={() => addCategory(category)}
                  >
                    {category}
                  </div>
                ))}
            </div>

            {/* Max Category Limit Message */}
            {quiz.category.length >= 5 && (
              <p className="text-gray-500 font-semibold">
                Maximum 5 categories selected. Delete a category to add more.
              </p>
            )}

            {/* Time Limit */}
            <div className="flex flex-col sm:flex-row w-full justify-start items-start sm:items-center mt-4">
              <h2 className="font-semibold text-md sm:text-lg flex justify-center items-center gap-2">
                <MdAccessTimeFilled className="text-[#5038bc]" />
                Time Limit
              </h2>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  value={quiz.timeLimit !== undefined ? quiz.timeLimit : ""}
                  onChange={(e) =>
                    setQuiz({
                      ...quiz,
                      timeLimit: e.target.value
                        ? parseInt(e.target.value)
                        : undefined, // Biar bisa kosong
                    })
                  }
                  className="w-24 mx-3  border-b-2 border-gray-400 focus:border-[#5038BC] focus:border-b-2 focus:outline-none transition-all "
                />
                <h2 className=" text-md flex justify-center items-center gap-2">
                  minute(s)
                </h2>
              </div>
            </div>
            {quiz.timeLimit == undefined || quiz.timeLimit <= 0 ? (
              <p className="text-red-500 font-semibold">
                The quiz should run for at least 1 minute.
              </p>
            ) : (
              <></>
            )}

            <div className="flex flex-col gap-2 my-4">
              <h2 className="flex items-center gap-2 font-semibold text-lg">
                <FaCalendarTimes className="text-[#5038BC]" />
                Quiz Opens
              </h2>
              <input
                type="datetime-local"
                className="w-48 cursor-pointer p-2 border-3 hover:bg-gray-200 border-[#5038BC] rounded-lg"
                value={quiz.dateOpens ? formatDateForInput(quiz.dateOpens) : ""}
                onChange={(e) =>
                  setQuiz({ ...quiz, dateOpens: e.target.value })
                }
              />

              <h2 className="flex items-center gap-2 font-semibold text-lg">
                <FaCalendarTimes className="text-[#5038BC]" />
                Quiz Closes
              </h2>
              <input
                type="datetime-local"
                className="w-48 cursor-pointer p-2 border-3 hover:bg-gray-200 border-[#5038BC] rounded-lg"
                value={
                  quiz.dateCloses ? formatDateForInput(quiz.dateCloses) : ""
                }
                onChange={(e) => {
                  setQuiz({ ...quiz, dateCloses: e.target.value });
                }}
              />
            </div>

            <textarea
              placeholder="Description"
              className="w-full my-5 fontOutfit text-md p-2  border-b-2 border-gray-400 focus:border-[#5038BC] focus:border-b-2 focus:outline-none transition-all"
              value={quiz.description}
              onChange={(e) =>
                setQuiz({ ...quiz, description: e.target.value })
              }
            />
          </div>

          {/* QUESTIONS */}
          <div className="p-4">
            {quiz.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="border-2 bg-white border-gray-400 p-4 mb-4 rounded-lg shadow-md relative"
              >
                <div className="flex flex-col ">
                  <div className="flex justify-between items-center sm:px-2">
                    {/* Question Type */}
                    <div className="flex items-center gap-1  w-fit px-2 sm:px-3 rounded-xl bg-gray-200 hover:bg-gray-100 cursor-pointer transition-all">
                      {question.type === "multiple-choice" ? (
                        <BiSolidSelectMultiple className="text-md sm:text-xl" />
                      ) : (
                        <MdOutlineShortText />
                      )}
                      <select
                        className=" p-1 sm:p-2 focus:outline-none cursor-pointer text-sm sm:text-md"
                        value={question.type}
                        onChange={(e) => {
                          const newType = e.target.value as
                            | "multiple-choice"
                            | "short-answer";
                          updateQuestion(qIndex, {
                            ...question,
                            type: newType,
                          });
                        }}
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
                    </div>
                    {/* Remove Question Button */}
                    <button
                      className=" flex items-center gap-2 h-fit bg-red-500 text-white px-2 py-1 rounded text-sm cursor-pointer transition-all hover:opacity-75"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <span className="hidden sm:block">Remove</span>
                      <TiCancel />
                    </button>
                  </div>

                  <span className="w-full bg-gray-200 h-[1.5px] my-2"></span>
                  {/* Question Text */}
                  <label className="font-semibold my-2 flex items-center gap-2 ">
                    <FaCircleQuestion className="text-[#5038BC]" />
                    {`Question ${qIndex + 1}`}
                  </label>
                  <textarea
                    className="p-2 rounded w-full bg-gray-200 focus:outline-none"
                    value={question.questionText}
                    placeholder="Enter question"
                    onChange={(e) =>
                      updateQuestion(qIndex, {
                        ...question,
                        questionText: e.target.value,
                      })
                    }
                  />

                  {/* Options (for multiple-choice only) */}
                  {question.type === "multiple-choice" && (
                    <div className="my-2">
                      <label className="font-medium flex items-center gap-2">
                        <TbLayoutListFilled className="text-[#5038BC]" />
                        Options
                      </label>
                      {question.options?.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex my-2 items-center gap-2"
                        >
                          <input
                            type="text"
                            className="border-2  border-[#5038BC]  p-2 rounded w-[95%] focus:outline-black"
                            value={option}
                            placeholder={`Option ${optIndex + 1}`}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])];
                              newOptions[optIndex] = e.target.value;
                              updateQuestion(qIndex, {
                                ...question,
                                options: newOptions,
                              });
                            }}
                          />
                          <button
                            className="text-red-500 font-bold"
                            onClick={() => removeOption(qIndex, optIndex)}
                          >
                            <TiCancel className="cursor-pointer hover:opacity-75" />
                          </button>
                        </div>
                      ))}
                      <button
                        className="bg-[#5038BC] text-white px-2 py-1 text-sm rounded flex items-center gap-2 my-4 hover:opacity-75 cursor-pointer transition-all"
                        onClick={() => addOption(qIndex)}
                      >
                        Add Option
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  )}

                  {/* Correct Answer */}
                  <label className="font-medium flex items-center gap-2 mt-4">
                    <AiFillCheckCircle className="text-[#5038BC]" />
                    Correct Answer
                  </label>
                  {question.type === "multiple-choice" ? (
                    <select
                      className="border-2 focus:border-black p-2 mb-2 border-[#5038BC]  rounded truncate w-[95%]"
                      value={question.correctAnswer}
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          ...question,
                          correctAnswer: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Correct Answer</option>
                      {question.options?.map((opt, optIndex) => (
                        <option key={optIndex} value={opt} className="truncate">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="border-2 focus:border-black p-2 my-2 border-[#5038BC]  rounded truncate w-[95%]"
                      value={question.correctAnswer}
                      placeholder="Enter correct answer"
                      onChange={(e) =>
                        updateQuestion(qIndex, {
                          ...question,
                          correctAnswer: e.target.value,
                        })
                      }
                    />
                  )}

                  {/* Explanation */}
                  <label className="font-medium flex items-center gap-2 my-2">
                    <HiPresentationChartLine className="text-[#5038BC]" />
                    Explanation
                  </label>
                  <textarea
                    className="bg-gray-200 focus:outline-none p-2 rounded w-full"
                    value={question.explanation}
                    placeholder="Explanation (optional)"
                    onChange={(e) =>
                      updateQuestion(qIndex, {
                        ...question,
                        explanation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ))}

            {/* Add Question Button */}
            <button
              className="bg-[#5038BC] flex items-center gap-2 transition-all cursor-pointer hover:opacity-75 text-white px-4 py-2 rounded"
              onClick={addQuestion}
            >
              Add Question
              <FaPlus />
            </button>
          </div>

          <div className="w-full h-[1.5px] bg-gray-200 my-10"></div>

          {/* Bottom part */}
          <div className="mx-5 flex flex-col md:flex-row gap-2 md:gap-5 mb-2">
            <h2 className="font-semibold text-md sm:text-lg flex my-2 items-center gap-2">
              <MdAccessTimeFilled className="text-[#5038bc]" />
              Quiz Visibility
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-black text-sm font-medium">
                {quiz.published ? "Published" : "Draft"}
              </span>
              <div
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  quiz.published ? "bg-[#5038BC]" : "bg-gray-400"
                }`}
                onClick={togglePublish}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                    quiz.published ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <MdPublish
                className={`text-xl transition-all ${
                  quiz.published ? "text-[#5038BC]" : "text-gray-400"
                }`}
              />
            </label>
          </div>
          <button
            className="bg-[#5038BC] my-4 mx-5 flex font-semibold mt-8 items-center gap-2 transition-all cursor-pointer hover:opacity-75 text-white px-4 py-2 rounded"
            onClick={handleSaveQuiz}
          >
            <FaSave />
            Save Quiz
          </button>
        </div>
      )}
      {!quiz && <Loading />}
    </>
  );
};

export default EditPage;
