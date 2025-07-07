'use client';
import React from 'react';

/**
 * A custom SVG component for the Project Raseed wallet icon, based on the provided logo image.
 * This can be used as a drop-in replacement for a standard icon component.
 */
export const WalletLogoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 185 80"
    className={className}
    aria-label="Project Raseed Logo"
  >
    {/* Wallet Icon */}
    <g id="wallet-icon">
      <defs>
        <clipPath id="wallet-clip">
          <rect x="0" y="0" width="95" height="80" rx="14" ry="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#wallet-clip)">
        <rect x="0" y="0" width="95" height="80" fill="#4285F4" />
        <path d="M0,0 H95 V48 C 65,60 30,36 0,48 Z" fill="#EA4335" />
        <path d="M0,0 H95 V32 C 65,44 30,20 0,32 Z" fill="#FBBC05" />
        <rect x="0" y="0" width="95" height="16" fill="#34A853" />
      </g>
    </g>

    {/* Letter 'R' */}
    <g id="letter-r" transform="translate(100,0)">
        {/* Blue Structure (stem and outer bowl) */}
        <path d="M0,0 H17 V80 H0V0Z" fill="#4285F4"/>
        <path d="M17,50 H42 C58,50 68,40 68,25 C68,10 58,0 42,0 H0V15 H42 C50,15 53,20 53,25 C53,30 50,35 42,35 H17V50Z" fill="#4285F4"/>
        
        {/* Red Bowl */}
        <path d="M17,15 H42 C50,15 53,20 53,25 C53,30 50,35 42,35 H17V15Z" fill="#EA4335"/>

        {/* Leg */}
        <path d="M28,50 L58,80 H45 L21,50H28Z" fill="#34A853"/>
        <path d="M17,50 L28,50 L23,60Z" fill="#FBBC05"/>

        {/* Sparkle */}
        <path d="M72,4 L75,11 L83,13 L75,15 L72,22 L69,15 L61,13 L69,11Z" fill="#A8C7FA"/>
    </g>
  </svg>
);
