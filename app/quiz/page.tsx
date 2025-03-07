"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";

const QuizPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <Loading />;
};

export default QuizPage;
