import React from "react";
import { Bookmark, ShoppingCart, MessageSquare } from "lucide-react";

const Topbar = () => {
  return (
    <div className="w-full px-6 py-4 bg-black border-b border-white/10 flex justify-between items-center text-sm">
      <div className="flex items-center gap-3 text-white">
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M12 2L22 20H2L12 2Z" />
        </svg>
        <span className="text-white/30">/</span>
        <span className="font-medium">GitLens</span>
      </div>
      <div className="flex gap-4 items-center text-white/70">
        <button className="px-3 py-1.5 border border-white/10 rounded-md hover:bg-white/5 hover:text-white transition-colors text-xs font-medium">
          Feedback
        </button>
        <button className="px-3 py-1.5 border border-white/10 rounded-md flex items-center gap-2 hover:bg-white/5 hover:text-white transition-colors text-xs font-medium">
          <Bookmark className="w-3.5 h-3.5" />
          Saved
        </button>
        <button className="px-3 py-1.5 border border-white/10 rounded-md flex items-center gap-2 hover:bg-white/5 hover:text-white transition-colors text-xs font-medium">
          <ShoppingCart className="w-3.5 h-3.5" />
          Cart
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-400 opacity-80 cursor-pointer hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
};

export default Topbar;
