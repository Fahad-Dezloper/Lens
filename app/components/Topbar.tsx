import React from "react";
import { Bookmark, ShoppingCart, MessageSquare } from "lucide-react";
import { ModeToggle } from "./ThemeToggler";

const Topbar = () => {
  return (
    <div className="w-full px-6 py-4 bg-background border-b border-foreground/10 flex justify-between items-center text-sm transition-colors duration-300">
      <div className="flex items-center gap-3 text-foreground">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2L22 20H2L12 2Z" />
        </svg>
        <span className="text-foreground/30">/</span>
        <span className="font-medium">GitLens</span>
      </div>
      <div className="flex gap-4 items-center text-foreground/70">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Topbar;
