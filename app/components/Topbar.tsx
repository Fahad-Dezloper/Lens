import React from 'react'
import { ModeToggle } from './ThemeToggler'

const Topbar = () => {
  return (
    <div className='w-full p-4 bg-red-400 flex justify-between'>
        <h1 className='font-pixel font-black tracking-widest'>GITLENS</h1>
        <div className='flex gap-2 items-center'>
            <span>Github</span>
            <span>Build by X</span>
            <ModeToggle />
        </div>
    </div>
  )
}

export default Topbar