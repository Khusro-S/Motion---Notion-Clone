"use client";

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";

import { cn } from "@/lib/utils";
import UserItem from "./UserItem";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Item from "./Item";
import { toast } from "sonner";
import DocumentsList from "./DocumentsList";
import TrashBox from "./TrashBox";
import Navbar from "./Navbar";

export default function Navigation() {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const search = useSearch();
  const settings = useSettings();
  const params = useParams();

  const router = useRouter();

  const create = useMutation(api.documents.create);

  // Query limits for display
  const documentCountData = useQuery(api.documents.getUserDocumentCount);
  const fileCountData = useQuery(api.documents.getUserFileCount);

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ComponentRef<"aside">>(null);
  const navbarRef = useRef<ComponentRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };
  const handleMouseUp = (_: MouseEvent) => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
    }

    setTimeout(() => setIsResetting(false), 300);
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreate = () => {
    const promise = create({ title: "Untitled Note" }).then((documentId) => {
      if (documentId) {
        router.push(`/documents/${documentId}`);
      }
    });

    toast.promise(promise, {
      loading: "Creating your new note...",
      success: "New note created!",
      error: (err) => {
        // Check if it's a limit error
        if (err?.message?.includes("limit reached")) {
          return err.message;
        }
        return "Failed to create your new note.";
      },
    });
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[100]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
          // isCollapsed && "w-16"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "cursor-pointer h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute right-2 opacity-0 group-hover/sidebar:opacity-100",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item label="Search" icon={Search} isSearch onClick={search.onOpen} />
          <Item label="Setting" icon={Settings} onClick={settings.onOpen} />
          <Item onClick={handleCreate} label="New page" icon={PlusCircle} />
          <div className="mt-4">
            {/* {documents?.map((document) => (
              <p key={document._id}>{document.title} </p>
            ))} */}
            <DocumentsList />

            <Item onClick={handleCreate} icon={Plus} label="Add a page" />

            <Popover>
              <PopoverTrigger className="w-full mt-4">
                <Item label="Trash" icon={Trash} />
              </PopoverTrigger>

              <PopoverContent
                side={isMobile ? "bottom" : "right"}
                className="p-0 w-72"
              >
                <TrashBox />
              </PopoverContent>
            </Popover>
          </div>

          {/* Demo Limits Indicator */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-secondary/50">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold mb-2">Demo Limits</p>
              <div className="flex justify-between">
                <span>Notes:</span>
                <span
                  className={cn(
                    documentCountData &&
                      documentCountData.count >= documentCountData.limit
                      ? "text-red-500 font-semibold"
                      : "text-foreground"
                  )}
                >
                  {documentCountData?.count ?? 0}/
                  {documentCountData?.limit ?? 10}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Files:</span>
                <span
                  className={cn(
                    fileCountData && fileCountData.count >= fileCountData.limit
                      ? "text-red-500 font-semibold"
                      : "text-foreground"
                  )}
                >
                  {fileCountData?.count ?? 0}/{fileCountData?.limit ?? 5}
                </span>
              </div>
            </div>
          </div>

          {/* appears when hovering over sidebar edge */}
          <div
            onMouseDown={handleMouseDown}
            onClick={resetWidth}
            className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
          />
        </div>
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params.documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground cursor-pointer"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
}
