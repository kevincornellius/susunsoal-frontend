import React, { useState, useEffect } from "react";
import Image from "next/image";

const Loading = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen text-black  w-full flex flex-col justify-center items-center gap-10">
      <Image
        src="/sit.png"
        alt="Sit Image"
        width={256}
        height={256}
        className="select-none"
      />
      <h1 className="font-black text-3xl overflow-hidden">
        LOADING<span className="text-[#5038BC]">{dots}</span>
      </h1>
    </div>
  );
};

export default Loading;
