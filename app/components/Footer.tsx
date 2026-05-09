import React from "react";

const Footer = () => {
  return (
    <div className="w-full px-6 py-4 bg-black border-t border-white/10 flex justify-between items-center text-[13px] text-white/40 font-medium">
      <div className="flex items-center gap-2">
        <span>GitLens</span>
        <span className="text-white/20">•</span>
        <span>Utility Version 1.0</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-white transition-colors">
          Status
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Privacy
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Terms
        </a>
      </div>
    </div>
  );
};

export default Footer;
