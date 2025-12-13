import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggler } from "./themeToggler";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 shadow-sm w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo1.png"
          alt="Anchor Logo"
          width={100}
          height={100}
          className="w-16 h-16 md:w-20  object-contain"
        />
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggler />
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
