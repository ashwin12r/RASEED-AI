'use client';
import Image from 'next/image';
import React from 'react';

/**
 * Displays the project logo by loading it from the /public directory.
 * Ensure you have placed your logo file at /public/logo.png.
 */
export const WalletLogoIcon = ({ className }: { className?: string }) => {
  return (
    <Image
      src="/logo.png"
      alt="Project Raseed Logo"
      width={185}
      height={80}
      className={className}
      priority
    />
  );
};
