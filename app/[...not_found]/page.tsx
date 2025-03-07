import React from "react";
import Image from "next/image";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center w-full  text-black">
      <Image
        src="/sad.png"
        alt="Sad Image"
        width={256}
        height={256}
        className="select-none"
      />
      <div className="flex flex-col justify-center items-center pt-10">
        <h1 className="font-black text-2xl lg:text-5xl overflow-hidden">
          404: <span className="text-[#5038BC]">Not Found</span>
        </h1>
        <p className="font-semibold text-sm lg:text-md">
          The page you are looking for does not exist :(
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
