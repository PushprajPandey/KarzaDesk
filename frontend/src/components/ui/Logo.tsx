"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = "" }: LogoProps): JSX.Element {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src="/logo.png"
        alt="KarzaDesk Logo"
        width={size}
        height={size}
        className="flex-shrink-0 object-contain"
        priority
      />
    </div>
  );
}
