"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Item from "./Item";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface DocumentsListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
}

export default function DocumentsList({
  parentDocumentId,
  level = 0,
}: DocumentsListProps) {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState({} as Record<string, boolean>);

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const documents = useQuery(api.documents.getSideBar, {
    parentDocument: parentDocumentId,
  });

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };
  // convex, this will never be undefined unless it's loading
  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }
  return (
    <>
      {/* {documents.length === 0 && (
        <p
          style={{ paddingLeft: level ? `${level * 12 + 25}px` : "12px" }}
          className={cn(
            "text-sm text-muted-foreground/80",
            level === 0 ? "font-normal py-2" : "font-medium hidden last:block"
          )}
        >
          {level === 0 ? "No notes yet" : "No pages inside"}
        </p>
      )} */}

      <p
        style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>

      {documents.map((document) => (
        <div key={document._id}>
          <Item
            id={document._id}
            onClick={() => {
              onRedirect(document._id);
            }}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={params.documentId === document._id}
            level={level}
            onExpand={() => onExpand(document._id)}
            expanded={expanded[document._id]}
          />

          {expanded[document._id] && (
            <DocumentsList parentDocumentId={document._id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
}
