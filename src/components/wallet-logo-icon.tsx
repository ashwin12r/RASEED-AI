
'use client';
import React from 'react';

/**
 * A custom SVG component for the Project Raseed wallet icon, based on the provided logo image.
 * This can be used as a drop-in replacement for a standard icon component.
 */
export const WalletLogoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 95 80"
    className={className}
    aria-label="Wallet Icon"
  >
    <defs>
      <path id="wallet-wave" d="M -5,80 V 50 C 20,70 50,40 95,50 V 80 Z" />
      <clipPath id="wallet-clip">
        <rect x="0" y="0" width="95" height="80" rx="14" ry="14" />
      </clipPath>
    </defs>
    <g clipPath="url(#wallet-clip)">
      <rect x="0" y="0" width="95" height="80" fill="#34A853" />
      <rect x="0" y="20" width="95" height="60" fill="#FBBC05" />
      <rect x="0" y="40" width="95" height="40" fill="#EA4335" />
      <use href="#wallet-wave" fill="#4285F4" />
    </g>
  </svg>
);
