"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRef, useState, useEffect } from "react";
import { useTitle } from "@/hooks/use-title";

interface TitleProps {
  initialData: Doc<"documents">;
}

export default function Title({ initialData }: TitleProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  const {
    editingTitleId,
    editingTitleValue,
    setEditing,
    updateValue,
    clearEditing,
  } = useTitle();

  const update = useMutation(api.documents.updateDocumentTitle);

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
    setEditing(initialData._id, initialData.title || "Untitled");
    setIsEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
    clearEditing();
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateValue(event.target.value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      disableInput();
    }
  };

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={displayTitle}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1"
        >
          <span className="truncate">{displayTitle}</span>
        </Button>
      )}
    </div>
  );
}

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-7 w-20 rounded-md" />;
};
