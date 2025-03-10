"use client";

import { usePathname, useRouter } from "next/navigation";
import { MdExplore } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { HiSquaresPlus } from "react-icons/hi2";
import { TbStackBack } from "react-icons/tb";
import { FaGoogle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { TiThMenu } from "react-icons/ti";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";

const menus = [
  { id: "", title: "Explore", icon: <MdExplore /> },
  { id: "create", title: "Create Quiz", icon: <HiSquaresPlus /> },
  { id: "profile", title: "Profile", icon: <FaUserCircle /> },
];

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
};

const Menubar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [prevToken, setPrevToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("User not logged in: No token found in localStorage");
        setUser(null);
        return;
      }

      if (token === prevToken) {
        return;
      }

      const cachedUser = sessionStorage.getItem("user");
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        return;
      }

      setPrevToken(token);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setUser(data.user);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchUser();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    sessionStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  return (
    <>
      {pathname.startsWith("/quiz/start") ? (
        <div className="  ">
          {/* Menu side */}
          <div
            className={`flex md:hidden z-50 text-black h-screen w-full md:w-70 bg-white drop-shadow-xl p-7 fixed  flex-col justify-around md:justify-between transition-transform duration-300 ${
              isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <div>
              <div className="hidden md:flex items-center gap-2 ">
                <TbStackBack className="text-6xl text-[#5038BC]" />
                <div className="flex flex-col items-start">
                  <p className="font-black text-xs text-[#5038BC] ">
                    KEVIN CORNELLIUS
                  </p>
                  <h1 className="font-bold text-3xl overflow-hidden">
                    <span className="text-[#333333]">Susun</span>
                    <span className="text-[#5038BC]">Soal</span>
                  </h1>
                </div>
              </div>
              <ul className="mt-20 md:mt-10 flex flex-col gap-5">
                {menus.map((menu) => (
                  <Link href={`/${menu.id}`} key={menu.id}>
                    <li
                      className={` flex p-2 cursor-pointer gap-2 items-center transition-all  ${
                        pathname === `/${menu.id}` ||
                        (menu.id === "" && pathname === "/") // Active state check
                          ? "bg-[#5038BC] font-semibold opacity-100 text-white rounded-2xl"
                          : "hover:opacity-50 text-black"
                      }`}
                      onClick={() => {
                        router.push(`/${menu.id}`);
                        setIsOpen(false);
                      }}
                    >
                      <span className="text-2xl">{menu.icon}</span>
                      <span className="text-lg">{menu.title}</span>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
            {/* Logo */}

            {/*google */}

            {user ? (
              <button
                className="flex bg-red-500 hover:bg-red-600 cursor-pointer text-white fontOutfit w-full px-4 py-4 rounded-2xl gap-5 items-center font-bold"
                onClick={handleLogout}
              >
                Log Out
              </button>
            ) : (
              <button
                className="flex bg-[#333333] hover:opacity-75 transition-all cursor-pointer text-white fontOutfit w-full px-4 py-4 rounded-2xl gap-5 items-center font-bold"
                onClick={() => {
                  router.push(
                    `/login?callback=${encodeURIComponent(pathname)}`
                  );
                  setIsOpen(false);
                }}
              >
                <FaGoogle className="text-xl" />
                Log in with Google
              </button>
            )}
          </div>
          {/* Quiz nav*/}
          <div
            className={`z-[39] text-black h-screen w-full md:w-70 bg-white drop-shadow-xl p-7 fixed hidden md:flex flex-col justify-between md:justify-end transition-transform duration-300`}
          >
            <div
              className="bg-[#5038BC] w-fit p-2 mb-5 hover:opacity-75 text-white rounded-2xl cursor-pointer"
              onClick={() => router.push("/")}
            >
              <FaArrowLeftLong />
            </div>
          </div>

          {/*Mobile*/}
          <div className="text-black h-[10vh] flex justify-between items-center w-full px-8 bg-white drop-shadow-xl fixed transition-all translate-y-0 md:-translate-y-100 z-50">
            <div className="flex items-center gap-2">
              <TbStackBack className="text-4xl text-[#5038BC]" />
              <div className="flex flex-col items-start">
                <h1 className="font-bold text-xl overflow-hidden">
                  <span className="text-[#333333]">Susun</span>
                  <span className="text-[#5038BC]">Soal</span>
                </h1>
              </div>
            </div>
            <button onClick={toggleMenu}>
              <TiThMenu className="text-3xl cursor-pointer" />
            </button>
          </div>
        </div>
      ) : (
        <div className="  ">
          {/* Menu side */}

          <div
            className={`z-50 text-black h-screen w-full md:w-70 bg-white drop-shadow-xl p-7 fixed flex flex-col justify-around md:justify-between transition-transform duration-300 ${
              isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <div>
              <div className="hidden md:flex items-center gap-2 ">
                <TbStackBack className="text-6xl text-[#5038BC]" />
                <div className="flex flex-col items-start">
                  <p className="font-black text-xs text-[#5038BC] ">
                    KEVIN CORNELLIUS
                  </p>
                  <h1 className="font-bold text-3xl overflow-hidden">
                    <span className="text-[#333333]">Susun</span>
                    <span className="text-[#5038BC]">Soal</span>
                  </h1>
                </div>
              </div>
              <ul className="mt-20 md:mt-10 flex flex-col gap-5">
                {menus.map((menu) => (
                  <Link href={`/${menu.id}`} key={menu.id}>
                    <li
                      className={` flex p-2 cursor-pointer gap-2 items-center transition-all  ${
                        pathname === `/${menu.id}` ||
                        (menu.id === "" && pathname === "/") // Active state check
                          ? "bg-[#5038BC] font-semibold opacity-100 text-white rounded-2xl"
                          : "hover:opacity-50 text-black"
                      }`}
                      onClick={() => {
                        router.push(`/${menu.id}`);
                        setIsOpen(false);
                      }}
                    >
                      <span className="text-2xl">{menu.icon}</span>
                      <span className="text-lg">{menu.title}</span>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
            {/* Logo */}

            {/*google */}

            {user ? (
              <button
                className="flex bg-red-500 hover:bg-red-600 cursor-pointer text-white fontOutfit w-full px-4 py-4 rounded-2xl gap-5 items-center font-bold"
                onClick={handleLogout}
              >
                Log Out
              </button>
            ) : (
              <button
                className="flex bg-[#333333] hover:opacity-75 transition-all cursor-pointer text-white fontOutfit w-full px-4 py-4 rounded-2xl gap-5 items-center font-bold"
                onClick={() => {
                  router.push(
                    `/login?callback=${encodeURIComponent(pathname)}`
                  );
                  setIsOpen(false);
                }}
              >
                <FaGoogle className="text-xl" />
                Log in with Google
              </button>
            )}
          </div>

          {/*Mobile*/}
          <div className="text-black h-[10vh] flex justify-between items-center w-full px-8 bg-white drop-shadow-xl fixed transition-all translate-y-0 md:-translate-y-100 z-50">
            <div className="flex items-center gap-2">
              <TbStackBack className="text-4xl text-[#5038BC]" />
              <div className="flex flex-col items-start">
                <h1 className="font-bold text-xl overflow-hidden">
                  <span className="text-[#333333]">Susun</span>
                  <span className="text-[#5038BC]">Soal</span>
                </h1>
              </div>
            </div>
            <button onClick={toggleMenu}>
              <TiThMenu className="text-3xl cursor-pointer" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Menubar;
