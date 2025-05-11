import React from "react";

const MainLogo = ({ className, width = 240, height = 60 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 240 60"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#9333ea", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Logo Shape */}
      <g transform="translate(10, 10)">
        {/* Main Text */}
        <text x="50" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="url(#logoGradient)">SexCity</text>
        <text x="170" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#333333">Hub</text>
        
        {/* Video Play Button Icon */}
        <circle cx="20" cy="24" r="15" fill="url(#logoGradient)" />
        <polygon points="15,17 15,31 28,24" fill="white" />
      </g>
    </svg>
  );
};

export default MainLogo; 