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
        <rect x="0" y="0" width="95" height="80" fill="#34A853" />
        <rect x="0" y="13" width="95" height="67" fill="#FBBC05" />
        <rect x="0" y="25" width="95" height="55" fill="#EA4335" />
        <path d="M0,42 C 25,54 60,30 95,42 V 80 H0Z" fill="#4285F4" />
      </g>
    </g>

    {/* Letter 'R' */}
    <g id="letter-r" transform="translate(100, 0)">
      {/* Base Blue Shape of R */}
      <path d="M0,0 H17 V80 H0Z M17,0 H45 C65,0 75,15 75,30 C75,45 65,55 45,55 H17V80 L58,80 L35,55 H17V0Z" fill="#4285F4"/>
      
      {/* Colored overlays on R */}
      <path d="M17,15 H45 C58,15 64,21 64,27.5 C64,34 58,40 45,40 H17V15Z" fill="#C9493B"/>
      <path d="M22,55 L58,80 H45 L17,60V55H22Z" fill="#34A853"/>
      <path d="M17,55 L22,55 L17,60Z" fill="#FBBC05"/>

      {/* Sparkle */}
      <path d="M72,4 L75,11 L83,13 L75,15 L72,22 L69,15 L61,13 L69,11Z" fill="#A8C7FA"/>
    </g>
  </svg>
);
