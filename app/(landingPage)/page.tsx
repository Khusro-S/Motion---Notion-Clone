import { Button } from "@/components/ui/button";
import Heading from "./_components/Heading";
import Heroes from "./_components/Heroes";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center justify-center text-center gap-y-8 flex-1 px-6 dark:bg-[#111111]">
        <Heading />
        <Heroes />
      </div>

      <Footer />
    </div>
  );
}
