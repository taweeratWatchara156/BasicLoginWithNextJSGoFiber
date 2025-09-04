"use client"

import { useEffect } from "react"
import NavBar from "../elements/NavBar"
import { useLoading } from "../stores/useLoading"
import { redirect } from "next/navigation"
import { useUser } from "../stores/useUser"

function page() {
  const setLoading = useLoading((state) => state.setLoading)
  const setUser = useUser((state) => state.setUser)
  const username = useUser((state) => state.username)
  const email = useUser((state) => state.email)

  useEffect(() => {

    const authen = async () => {
      setLoading(true)
      try {
          const res = await fetch("/api/users/me", { credentials: "include" })
          const data: any = await res.json() // await here!
          if (!data.success) {
            redirect("/login")
          }

          setUser(data.user.username, data.user.email)

        } catch (err) {
          redirect("/login")
        } finally {
          setLoading(false)
        }
      }

      authen()
  }, [setLoading])

  const logout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include"
    })

    setUser("", "")
    redirect("/login")
  }

  return (
    <div className="flex flex-col w-full h-full">
      <NavBar username={username} logoutHandler={logout}/>
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center">
        {/* Card Container */}
        <div className="p-5 rounded-xl shadow-2xl shadow-[#E9E294] border border-gray-200 ">
          {/* Title */}
          <h1 className="text-gray-600 text-center text-3xl font-bold">User Data</h1>
          <div className="flex flex-col my-2">
            <div className="flex gap-2 text-xl text-gray-600 ">
              <span className="font-bold">Username : </span>
              <span>{username}</span>
            </div>

            <div className="flex gap-2 text-xl text-gray-600 ">
              <span className="font-bold">Email : </span>
              <span>{email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
