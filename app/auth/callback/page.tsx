"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/components/loading";
import toast from "react-hot-toast";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthCallback />
    </Suspense>
  );
}

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const callbackUrl = searchParams.get("callback") || "/"; // Default to home

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token); // Store token (or use cookies)
      sessionStorage.removeItem("user");
      router.replace(callbackUrl); // Redirect user back to original page
      toast.success("Logged in successfully!");
    } else {
      router.replace("/login?error=missing_token");
    }
  }, [token, callbackUrl, router]);

  return <Loading />; // Temporary loading message while redirecting
}
