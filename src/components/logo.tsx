import Link from "next/link";
import React from "react";

export function Logo() {
  return (
    <Link href="/" className="inline-block">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={180} 
        height={45} 
        viewBox="0 0 240 60"
        className="hover:opacity-90 transition-opacity"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#f97316", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#f59e0b", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Logo Shape */}
        <g transform="translate(10, 10)">
          {/* Main Text */}
          <text x="50" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="url(#logoGradient)">SexCity</text>
          <text x="160" y="30" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#333333">Hub</text>
          
          {/* Video Play Button Icon */}
          <circle cx="20" cy="24" r="15" fill="url(#logoGradient)" />
          <polygon points="12,16 12,32 30,24" fill="white" />
        </g>
      </svg>
    </Link>
  );
} 