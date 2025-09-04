"use client"

import { redirect } from "next/navigation";
import { useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function LoginPage() {

  useEffect(() => {
    const timer = setTimeout(() => {
      redirect("/login")
    }, 2000)
  }, []) 

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#AE75DA]">
        <div className="flex flex-col items-center text-white font-bold gap-5">
          <AiOutlineLoading3Quarters className="size-[50px] animate-spin"/>
          <p className="text-xl">Redirecting</p>
        </div>
    </div>
  );
}
