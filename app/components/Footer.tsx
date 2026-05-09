import React from "react";

const Footer = () => {
  return (
    <div className="w-full px-6 py-4 bg-[#020408] border-t border-border flex justify-between items-center text-[13px] text-muted-foreground font-medium transition-colors duration-300">
      <div className="flex items-center gap-2">
        {/* <span>GitLens</span> */}
        <span className="opacity-20">•</span>
        <span>Version 1.0</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-foreground transition-colors">
          Status
        </a>
      </div>
    </div>
  );
};

export default Footer;
