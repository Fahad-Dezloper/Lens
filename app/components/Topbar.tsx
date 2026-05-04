import React from 'react'
import { ModeToggle } from './ThemeToggler'

const Topbar = () => {
  return (
    <div className='w-full px-12 py-6 bg-background border-b-2 border-foreground flex justify-between items-center'>
        <h1 className='font-pixel font-black tracking-tighter text-foreground text-2xl uppercase'>LENS</h1>
        <div className='flex gap-8 items-center'>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">GITHUB TRACKER</span>
            <ModeToggle />
        </div>
    </div>
  )
}

export default Topbar