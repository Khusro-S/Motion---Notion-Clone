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
import Link from "next/link";

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
  const handleMouseUp = () => {
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
        // Check if it's a limit error and return the full error message
        const errorMessage = err instanceof Error ? err.message : String(err);

        if (
          errorMessage.toLowerCase().includes("limit reached") ||
          (documentCountData && documentCountData >= documentCountData && 10)
        ) {
          return "Limit reached. Max 10 notes allowed!";
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
                      documentCountData.count >= documentCountData.limit - 1
                      ? "text-red-500 font-semibold"
                      : documentCountData &&
                        documentCountData.count >=
                          documentCountData.limit - 3 &&
                        documentCountData.count <= documentCountData.limit - 2
                      ? "text-orange-300 font-semibold"
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
                      : fileCountData &&
                        fileCountData.count >= fileCountData.limit - 2 &&
                        fileCountData.count < fileCountData.limit
                      ? "text-orange-500 font-semibold"
                      : "text-foreground"
                  )}
                >
                  {fileCountData?.count ?? 0}/{fileCountData?.limit ?? 5}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 border-t border-border pt-3 bg-secondary/50 text-center text-[11px] text-muted-foreground flex flex-col items-center justify-center gap-y-2">
              <div className="flex items-center justify-center gap-x-2">
                <Link
                  href="https://www.linkedin.com/in/khusro-sakhi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 text-gray-500 hover:text-[#0A66C2] dark:hover:text-[#3799EF] transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-xs font-medium">LinkedIn</span>
                </Link>

                <div className="h-4 w-px bg-gray-300"></div>

                <Link
                  href="https://github.com/Khusro-S/Motion---Notion-Clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 text-gray-500 hover:text-black dark:hover:text-gray-200 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="text-xs font-medium">GitHub</span>
                </Link>
              </div>

              <span className="text-xs text-gray-400">
                © 2025 Built with ❤️
              </span>
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
