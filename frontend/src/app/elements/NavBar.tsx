import React from 'react'
import { FaUser } from 'react-icons/fa'

function NavBar({ username, logoutHandler }: {username:string | null, logoutHandler:any}) {
  return (
    <div className='w-full p-5 bg-[#AE75DA] flex justify-between items-center'>
        {/* Username */}
        <div className='flex items-center gap-2 text-white text-xl'>
            <FaUser/>
            <span className='flex gap-2'><p className='font-bold'>Dashboard</p> for {username}</span>
        </div>

        {/* Logout Button */}
        <button className='text-white font-bold bg-red-500 px-5 py-2 rounded-md text-xl duration-100 hover:bg-red-600 cursor-pointer' onClick={logoutHandler}>Login</button>
    </div>
  )
}

export default NavBar
