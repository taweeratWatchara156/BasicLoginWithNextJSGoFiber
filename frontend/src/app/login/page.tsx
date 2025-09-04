"use client"

import { redirect, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useLoading } from '../stores/useLoading'
import toast, { Toaster } from 'react-hot-toast'
import { useUser } from '../stores/useUser'

function page() {
    const [passwordState, setPasswordState] = useState<boolean>(false)
    const [password, setPassword] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [rememberme, setRememeberme] = useState<boolean>(false)
    const [loginButtonState, setLoginButtonState] = useState<boolean>(false)
    const route = useRouter();
    const setLoading = useLoading((state) => state.setLoading)
    const setUser = useUser((state) => state.setUser)

    useEffect(() => {
    const authen = async () => {
      setLoading(true)
      try {
          const res = await fetch("/api/users/me", { credentials: "include" })
          const data = await res.json()
          if (data.success) {
            route.push("/dashboard")
          }

        } catch (err) {
          toast.error("Something went wrong")
        } finally {
          setLoading(false)
        }
      }

      authen()
  }, [setLoading])

    useEffect(() => {
        if (!username || !password) {
            setLoginButtonState(false)
        }else{
            setLoginButtonState(true)
        }
    }, [username, password])

    const loginHandler = async () => {
        setLoading(true)
        try{
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, rememberme }),
                credentials: "include"
            })

            const data = await res.json()
            console.log(data)
            if (!res.ok){
                setLoading(false)
                return toast.error("Failed to login!")
            }
            
            console.log(data)
            setUser(data.user.username, data.user.email)
            setLoading(false)
            toast.success("Logged in successfully")
            toast.success("Redirecting to Dashboard...")
            setTimeout(() => {
                redirect("/dashboard")
            }, 2000);
        }catch(err){
            console.error(err)
            toast.error("Something went wrong")
        }
    }

    return (
        <div className='p-3 sm:p-0 w-full h-full bg-[#AE75DA] flex items-center justify-center'>
            {/* Container */}
            <div className='w-full sm:w-auto p-5 xs:p-8 sm:p-10 bg-white rounded-xl shadow-2xl shadow-[#E9E294]'>
                {/* Header */}
                <div className='w-full h-full'>
                    <p className='text-gray-400 text-xs xs:text-sm sm:text-base'>Please enter your details</p>
                    <h1 className='text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-600'>Welcome back</h1>
                </div>

                {/* Inputs */}
                <div className='flex flex-col gap-3 sm:gap-5 my-5 sm:my-7'>
                    <input type="text" placeholder="Username" className='border-gray-200 border-[2px] w-full sm:w-[450px] p-5 py-3 outline-none rounded-md text-xs xs:text-sm sm:text-base'   onChange={(e) => setUsername(e.target.value)} />
                    <div className='flex relative'>
                        <input type={!passwordState ? "password" : "text"} placeholder="Password" className='border-gray-200 border-[2px] w-full sm:w-[450px] p-5 py-3 outline-none rounded-md text-xs xs:text-sm sm:text-base' onChange={(e) => setPassword(e.target.value)}/>
                        {
                            !passwordState ?
                                <FaEyeSlash className='absolute bottom-0 top-0 my-auto right-0 mr-5 size-[15px] xs:size-[20px] duration-100 hover:scale-[1.25] cursor-pointer active:scale-[1]' onClick={() => setPasswordState(!passwordState)} />
                                :
                                <FaEye className='absolute bottom-0 top-0 my-auto right-0 mr-5 size-[15px] xs:size-[20px] duration-100 hover:scale-[1.25] cursor-pointer active:scale-[1]' onClick={() => setPasswordState(!passwordState)} />
                        }
                    </div>
                    {/* Remember me && password reset */}
                    <div className='flex justify-between items-center text-gray-600'>
                        {/* remember me */}
                        <div className='flex gap-2 items-center'>
                            <input type="checkbox" name="rememberme" id="rememberme" className='w-[13px] xs:w-[15px] h-8 translate-y-[1px]' onChange={(e) => setRememeberme(e.target.checked)}/>
                            <p className='text-xs xs:text-sm sm:text-base'>Remember me</p>
                        </div>

                        <p className='underline text-[#AE75DA] text-xs xs:text-sm sm:text-base'>Forgot password</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className='flex flex-col'>
                    <button className={`${loginButtonState ? "bg-[#AE75DA]" : "bg-[#c8bcd2]"} duration-150 text-white font-bold py-3 rounded-md text-sm xs:text-base sm:text-xl ${loginButtonState ? "cursor-pointer" : "cursor-default"}`} disabled={!loginButtonState} onClick={loginHandler}>Login</button>
                </div>

                {/* Sign Up Button */}
                <div className='flex gap-2 mt-3 sm:mt-5 justify-center text-xs xs:text-sm sm:text-base'>
                    <p className='text-gray-600'>Don't have an account?</p>
                    <p className='text-[#AE75DA] underline cursor-pointer' onClick={() => route.push("/signup")}>Sign Up</p>
                </div>
            </div>
            <Toaster position='bottom-right'/>
        </div>
    )
}

export default page
