import Image from "next/image";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export default function Logo() {
  return (
    <div className="hidden md:flex items-center">
      <Image
        src="/motion-logo.png"
        height="40"
        width="40"
        alt="Logo"
        className="dark:hidden"
      />
      <Image
        src="/motion-logo-dark.png"
        height="40"
        width="40"
        alt="Logo"
        className="dark:block hidden"
      />
      <p className={cn("font-semibold", font.className)}>Motion</p>
    </div>
  );
}
