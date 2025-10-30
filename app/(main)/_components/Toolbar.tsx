"use client";

import { Doc } from "@/convex/_generated/dataModel";
import IconPicker from "./IconPicker";
import { Button } from "@/components/ui/button";
import { ImageIcon, Smile, X } from "lucide-react";

import React, { ComponentRef, useEffect, useRef, useState } from "react";

import TextareaAutosize from "react-textarea-autosize";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTitle } from "@/hooks/use-title";
import { cn } from "@/lib/utils";
import { useCoverImage } from "@/hooks/use-cover-image";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
}

export default function Toolbar({ initialData, preview }: ToolbarProps) {
  const inputRef = useRef<ComponentRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    editingTitleId,
    editingTitleValue,
    setEditing,
    updateValue,
    clearEditing,
  } = useTitle();

  const coverImage = useCoverImage();

  const update = useMutation(api.documents.updateDocumentTitle);
  const remove = useMutation(api.documents.removeIcon);

  // Determine what to display: if this document is being edited, use store value, otherwise use initialData
  const displayTitle =
    editingTitleId === initialData._id
      ? editingTitleValue
      : initialData.title || "Untitled";

  // Debounce effect - waits 500ms after user stops typing
  useEffect(() => {
    if (editingTitleId !== initialData._id) return;

    const timer = setTimeout(() => {
      if (editingTitleValue !== initialData.title) {
        update({
          id: initialData._id,
          title: editingTitleValue || "Untitled",
        });
      }
    }, 500);

    // Cleanup: cancel the timer if user types again
    return () => {
      clearTimeout(timer);
    };
  }, [
    editingTitleValue,
    editingTitleId,
    initialData._id,
    initialData.title,
    update,
  ]);

  const enableInput = () => {
    if (preview) return;
    setEditing(initialData._id, initialData.title || "Untitled");
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
    clearEditing();
    inputRef.current?.blur();
  };

  const onInput = (value: string) => {
    updateValue(value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  const onRemoveIcon = () => {
    remove({
      id: initialData._id,
    });
  };

  return (
    <div className="pl-[54px] group relative">
      {!!initialData.icon && !preview && !initialData.isArchived && (
        <div className="flex items-center gap-x-2 group/icon pt-4">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl hover:opacity-75 transition cursor-pointer pt-14">
              {initialData.icon}
            </p>
          </IconPicker>

          <Button
            onClick={onRemoveIcon}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}

      {!preview && !initialData.isArchived && (
        <div
          className={cn(
            "left-[54px] opacity-0 transition-opacity flex items-center gap-x-2 z-1000 pt-4",
            // Mobile: always visible
            // "opacity-100 pb-4",

            // Desktop: only visible on hover
            "md:opacity-0 md:group-hover:opacity-100",
            !initialData.icon ? "top-15" : "top-35"
          )}
        >
          {!initialData.icon && (
            <IconPicker onChange={onIconSelect} asChild>
              <Button
                className="text-muted-foreground text-xs"
                variant="outline"
                size="sm"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </IconPicker>
          )}
          {/* {initialData.icon && (
            <Button
              className="text-muted-foreground text-sm"
              variant="outline"
              size="sm"
              onClick={onRemoveIcon}
            >
              <X className="h-4 w-4" />
              Remove icon
            </Button>
          )} */}
          {!initialData.coverImage && (
            <Button
              className="text-muted-foreground text-sm"
              variant="outline"
              size="sm"
              onClick={coverImage.onOpen}
            >
              <ImageIcon className="h-4 w-4" />
              Add cover
            </Button>
          )}
        </div>
      )}
      {!preview && !initialData.isArchived && (
        <TextareaAutosize
          onClick={enableInput}
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={displayTitle}
          onChange={(e) => onInput(e.target.value)}
          className={cn(
            "text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none w-full ",
            initialData.icon ? "mt-3" : ""
          )}
        />
      )}
      {preview && !isEditing && (
        <div
          //   onClick={enableInput}
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          {displayTitle}
        </div>
      )}
      {initialData.isArchived && (
        <div
          //   onClick={enableInput}
          className="pb-[11.5px] pt-0 text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          <p className="text-6xl pt-6">{initialData.icon}</p>
          {displayTitle}
        </div>
      )}
    </div>
  );
}
