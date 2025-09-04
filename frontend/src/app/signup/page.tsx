"use client"

import { redirect, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useLoading } from '../stores/useLoading'

function page() {
    const [passwordState, setPasswordState] = useState<boolean>(false)
    const [confirmPasswordState, setConfirmPasswordState] = useState<boolean>(false)
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [signUpButtonState, setSignUpButtonState] = useState<boolean>(false)
    const route = useRouter()
    const setLoading = useLoading((state) => state.setLoading)

    useEffect(() => {
        if (!username || !password || !confirmPassword || !email) {
            setSignUpButtonState(false)
        }else{
            setSignUpButtonState(true)
        }
    }, [username, password, confirmPassword, email])

    const signUpHandler = () => {
        if (!isValidEmail(email)){
            return toast.error("Email is not valid!")
        }

        if (password != confirmPassword){
            return toast.error("Password does not match!")
        }

        setLoading(true)

        const signUp = async () => {
            try{
                const res = await fetch("/api/users",{
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                })

                const data = await res.json()
                if(!data.success){
                    setLoading(false)
                    toast.error(data.error)
                }else{
                    setLoading(false)
                    toast.success(data.message)
                    toast.success("Redirecting to Login page...")
                    setTimeout(() => {
                        redirect("/login")
                    }, 2000);
                }
            }catch(err){
                setLoading(false)
                toast.error("Something went wrong!")
            }
        }

        signUp()
    }

    function isValidEmail(email:string) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return emailRegex.test(email);
    }

    return (
        <div className='p-3 sm:p-0 w-full h-full bg-[#AE75DA] flex items-center justify-center'>
            {/* Container */}
            <div className='w-full sm:w-auto p-5 xs:p-8 sm:p-10 bg-white rounded-xl shadow-2xl shadow-[#E9E294]'>
                {/* Header */}
                <div className='w-full h-full'>
                    <p className='text-gray-400 text-xs xs:text-sm sm:text-base'>Please enter your details</p>
                    <h1 className='text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-600'>Sign up new account</h1>
                </div>

                {/* Inputs */}
                <div className='flex flex-col gap-3 sm:gap-5 my-5 sm:my-7'>
                    <input type="text" placeholder="Username" className='border-gray-200 border-[2px] w-full sm:w-[450px] p-5 py-3 outline-none rounded-md text-xs xs:text-sm sm:text-base'   onChange={(e) => setUsername(e.target.value)} />
                    <input type="email" placeholder="Email" className='border-gray-200 border-[2px] w-full sm:w-[450px] p-5 py-3 outline-none rounded-md text-xs xs:text-sm sm:text-base'   onChange={(e) => setEmail(e.target.value)} />
                    {/* Password */}
                    <div className='flex relative'>
                        <input type={!passwordState ? "password" : "text"} placeholder="Password" className='border-gray-200 border-[2px] w-full sm:w-[450px] p-5 py-3 outline-none rounded-md text-xs xs:text-sm sm:text-base' onChange={(e) => setPassword(e.target.value)}/>
                        {
                            !passwordState ?
                                <FaEyeSlash className='absolute bottom-0 top-0 my-auto right-0 mr-5 size-[15px] xs:size-[20px] duration-100 hover:scale-[1.25] cursor-pointer active:scale-[1]' onClick={() => setPasswordState(!passwordState)} />
                                :
                                <FaEye className='absolute bottom-0 top-0 my-auto right-0 mr-5 size-[15px] xs:size-[20px] duration-100 hover:scale-[1.25] cursor-pointer active:scale-[1]' onClick={() => setPasswordState(!passwordState)} />
                        }
                    </div>
                    {/* Confirm Password */}
                    <div className='flex relative'>
                        <input type={!confirmPasswordState ? "password" : "text"} placeholder="Confirm password" className='border-gray-200 border-[2px] w-full sm:w-[450px] p-5 py-3 outline-none rounded-md text-xs xs:text-sm sm:text-base' onChange={(e) => setConfirmPassword(e.target.value)}/>
                        {
                            !confirmPasswordState ?
                                <FaEyeSlash className='absolute bottom-0 top-0 my-auto right-0 mr-5 size-[15px] xs:size-[20px] duration-100 hover:scale-[1.25] cursor-pointer active:scale-[1]' onClick={() => setConfirmPasswordState(!confirmPasswordState)} />
                                :
                                <FaEye className='absolute bottom-0 top-0 my-auto right-0 mr-5 size-[15px] xs:size-[20px] duration-100 hover:scale-[1.25] cursor-pointer active:scale-[1]' onClick={() => setConfirmPasswordState(!confirmPasswordState)} />
                        }
                    </div>
                </div>

                {/* Buttons */}
                <div className='flex flex-col'>
                    <button className={`${signUpButtonState ? "bg-[#AE75DA]" : "bg-[#c8bcd2]"} duration-150 text-white font-bold py-3 rounded-md text-sm xs:text-base sm:text-xl ${signUpButtonState ? "cursor-pointer" : "cursor-default"}`} disabled={!signUpButtonState} onClick={signUpHandler}>Sign Up</button>
                </div>

                {/* Sign Up Button */}
                <div className='flex gap-2 mt-3 sm:mt-5 justify-center text-xs xs:text-sm sm:text-base'>
                    <p className='text-gray-600'>Already have an account?</p>
                    <p className='text-[#AE75DA] underline cursor-pointer' onClick={() => route.push("/login")}>Login</p>
                </div>
            </div>
            <Toaster position='bottom-right'/>
        </div>
    )
}

export default page
