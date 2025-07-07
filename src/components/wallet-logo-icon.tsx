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
    {/* Wallet Icon on the left */}
    <g id="wallet">
      <defs>
        <clipPath id="wallet-clip-path">
          <rect x="0" y="0" width="95" height="80" rx="14" ry="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#wallet-clip-path)">
        {/* Blue background layer */}
        <rect x="0" y="0" width="95" height="80" fill="#4285F4" />
        {/* Red layer with wave */}
        <path d="M0,0 H95 V48 C 65,60 30,36 0,48 Z" fill="#EA4335" />
        {/* Yellow layer with wave */}
        <path d="M0,0 H95 V32 C 65,44 30,20 0,32 Z" fill="#FBBC05" />
        {/* Green top layer */}
        <path d="M0,0 H95 V16 H0 Z" fill="#34A853" />
      </g>
    </g>

    {/* Letter 'R' on the right */}
    <g id="letter-r" transform="translate(10, 0)">
      {/* Base of R in blue */}
      <path d="M105,0 V80 H122 V45 C142,45 152,35 152,22.5 C152,10 142,0 122,0 Z" fill="#4285F4" />
      {/* Red overlay on bowl */}
      <path d="M122,0 C130,0 145,5 145,15 C145,8 138,0 122,0 Z" fill="#C63828" />
      {/* Green leg */}
      <path d="M128,45 L150,80 H140 L122,48 Z" fill="#34A853" />
      {/* Yellow leg segment */}
      <path d="M128,45 L132,54 L124,49 Z" fill="#FBBC05" />
      
      {/* Sparkle */}
      <path d="M160,5 L163,12 L171,14 L163,16 L160,23 L157,16 L149,14 L157,12 Z" fill="#A8C7FA" />
    </g>
  </svg>
);