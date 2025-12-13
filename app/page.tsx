import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="px-4 flex min-h-[92vh] w-full flex-col items-center justify-center">
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
