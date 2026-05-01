import React from 'react'
import { ModeToggle } from './ThemeToggler'

const Topbar = () => {
  return (
    <div className='w-full px-12 py-4 bg-header-footer border-b border-border flex justify-between items-center'>
        <h1 className='font-pixel font-black tracking-widest text-primary leading-0'>GITLENS</h1>
        <div className='flex gap-4 items-center'>
            <span className="text-sm text-muted-foreground">Github</span>
            <span className="text-sm text-muted-foreground">Build by X</span>
            <ModeToggle />
        </div>
    </div>
  )
}

export default Topbar