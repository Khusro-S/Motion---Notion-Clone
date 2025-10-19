import { Button } from "@/components/ui/button";
import Logo from "./Logo";

export default function Footer() {
  return (
    <div className="flex items-center w-full px-6 pb-6 bg-background z-50 dark:bg-[#111111]">
      <Logo />
      <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground">
        <Button variant="ghost" size="sm">
          Privacy Policy
        </Button>
        <Button variant="ghost" size="sm">
          Terms & Conditions
        </Button>
      </div>
    </div>
  );
}
