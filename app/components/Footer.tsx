import React from "react";

const Footer = () => {
  return (
    <div className="w-full px-6 py-4 bg-background border-t border-foreground/10 flex justify-between items-center text-[13px] text-foreground/40 font-medium transition-colors duration-300">
      <div className="flex items-center gap-2">
        <span>GitLens</span>
        <span className="text-foreground/20">•</span>
        <span>Utility Version 1.0</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-foreground transition-colors">
          Status
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          Privacy
        </a>
        <a href="#" className="hover:text-foreground transition-colors">
          Terms
        </a>
      </div>
    </div>
  );
};

export default Footer;
