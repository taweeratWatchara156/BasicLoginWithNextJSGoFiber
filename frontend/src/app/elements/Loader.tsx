"use client"

import React from 'react'
import { useLoading } from '../stores/useLoading'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

function Loader() {
    const loading = useLoading((state) => state.loading)

  return (
    <div className={`${loading ? "absolute" : "hidden"} w-screen h-screen bg-[#00000044] flex justify-center items-center z-[100]`}>
        <AiOutlineLoading3Quarters className="text-6xl animate-spin text-white"/>
    </div>
  )
}

export default Loader
