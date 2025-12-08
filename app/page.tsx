import { ThemeToggler } from "@/components/themeToggler";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative px-4 flex min-h-screen w-full flex-col items-center justify-center">
      <div className="absolute top-0 left-4 md:left-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Anchor Logo"
            width={100}
            height={100}
            className="w-16 h-16 md:w-24 md:h-24 object-contain"
          />
        </Link>
      </div>
      <div className="absolute top-4 right-4 md:right-8">
        <ThemeToggler />
      </div>
      <div className="max-w-5xl mx-auto">
        <p className="text-justify">
          "When scientists analyze people who appear to have tremendous
          self-control, it turns out those individuals aren't all that different
          from those who are struggling. Instead, 'disciplined' people are
          better at structuring their lives in a way that does not require
          heroic willpower and self-control."
        </p>
        <p className="w-full text-start italic font-semibold my-4">
          — James Clear
        </p>

        <div className="w-full text-start">
          <Button size="lg" className="cursor-pointer">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
