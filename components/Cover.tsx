import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImageIcon, X, MoreHorizontal } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { useCoverImage } from "@/hooks/use-cover-image";

interface CoverProps {
  url?: string;
  preview?: boolean;
}

export default function Cover({ url, preview }: CoverProps) {
  //   const coverImage = useCoverImage();

  // const onRemove = () => {
  //   // TODO: Implement remove cover functionality
  //   console.log("Remove cover");
  // };

  // const onReplace = () => {
  //   coverImage.onOpen();
  // };
  return (
    <div
      className={cn(
        "relative w-full mt-8 md:h-[35vh] h-[25vh] group",
        !url && "h-[12vh]",
        url && "bg-muted"
      )}
    >
      {!!url && (
        <Image src={url} fill alt="Cover Image" className="object-cover" />
      )}
      {url && !preview && (
        // <>
        //   {/* Desktop: Hover buttons */}
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 items-center gap-x-2 hidden md:flex">
          <Button className="text-xs" size="sm" onClick={() => {}}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button className="text-xs" size="sm" onClick={() => {}}>
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>

        //   Mobile: Dropdown menu with ... button
        //   <div className="absolute bottom-5 right-5 md:hidden">
        //     <DropdownMenu>
        //       <DropdownMenuTrigger asChild>
        //         <Button
        //           className="h-8 w-8 p-0"
        //           size="sm"
        //           //   variant="outline"
        //           aria-label="Cover options"
        //         >
        //           <MoreHorizontal className="h-4 w-4" />
        //         </Button>
        //       </DropdownMenuTrigger>
        //       <DropdownMenuContent align="end" className="w-48">
        //         <DropdownMenuItem onClick={onReplace}>
        //           <ImageIcon className="h-4 w-4 mr-2" />
        //           Change cover
        //         </DropdownMenuItem>
        //         <DropdownMenuItem onClick={onRemove} className="text-red-600">
        //           <X className="h-4 w-4 mr-2" />
        //           Remove
        //         </DropdownMenuItem>
        //       </DropdownMenuContent>
        //     </DropdownMenu>
        //   </div>
        // </>
      )}
    </div>
  );
}
