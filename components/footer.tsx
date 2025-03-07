"use client";
import React from "react";
import { TbStackBack } from "react-icons/tb";
import { FaGlobeEurope } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { FaGithub } from "react-icons/fa";

const menus = [
  {
    id: "https://kevincornellius.vercel.app/",
    title: "kevincornellius.vercel.app",
    icon: <FaGlobeEurope />,
  },
  {
    id: "https://www.instagram.com/kevin_cornelliuss/",
    title: "@kevin_cornelliuss",
    icon: <RiInstagramFill />,
  },
  {
    id: "https://github.com/kevincornellius/",
    title: "kevincornellius",
    icon: <FaGithub />,
  },
];

const Footer = () => {
  return (
    <div className="w-full text-black bg-purple-50 pt-10 px-5 md:px-20 py-4 flex flex-col justify-center items-center gap-20 lg:gap-10">
      <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-3">
        <div className="flex justify-center items-center gap-3 ">
          <TbStackBack className="text-5xl text-[#5038BC]" />
          <div>
            <h1 className="font-bold">Made By Kevin Cornellius</h1>
            <h1 className="font-bold">
              Inspired by{" "}
              <a
                href="https://susunjadwal.cs.ui.ac.id/"
                className="text-[#5038BC] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                SusunJadwal
              </a>
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <h1 className="font-bold">
            {" "}
            <span className="text-[#333333]">My</span>
            <span className="text-[#5038BC]"> Contacts</span>
          </h1>
          <ul className="mt-2 flex flex-col gap-1 items-end">
            {menus.map((menu) => (
              <li
                key={menu.id}
                className={` flex cursor-pointer items-center transition-all font-semibold`}
              >
                <a
                  href={menu.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2 items-center w-full"
                >
                  <span className="text-md underline">{menu.title}</span>
                  <span className="text-xl text-[#5038BC]">{menu.icon}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <h1 className="">© 2025 Kevin Cornellius</h1>
    </div>
  );
};

export default Footer;
