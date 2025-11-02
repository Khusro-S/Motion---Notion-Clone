"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

import { useMemo } from "react";

import Toolbar from "@/app/(main)/_components/Toolbar";
import Cover from "@/components/Cover";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";

export default function DocumentIdPage() {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/Editor"), { ssr: false }),
    []
  ); // recommended from the docs
  const params = useParams();
  const documentId = params.documentId as Id<"documents">;
  const document = useQuery(api.documents.getDocumentById, {
    documentId,
  });

  const update = useMutation(api.documents.updateDocumentTitle);

  const onChange = (content: string) => {
    update({
      id: params.documentId as Id<"documents">,
      content,
    });
  };

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-8">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-1/2" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );

    // return (
    //   <div className="h-full flex items-center justify-center">
    //     <Spinner size="lg" />
    //   </div>
    // );
  }

  if (document === null || !document.isPublished) {
    notFound();
  }

  return (
    <div className="pb-40 dark bg-[#111111]">
      <Cover
        preview
        isArchived={document.isArchived}
        url={document.coverImage}
      />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
        <Toolbar preview initialData={document} />
        <Editor
          editable={false}
          documentId={documentId}
          onChange={onChange}
          initialContent={document.content}
        />
        {/* <Editor /> */}
      </div>
    </div>
  );
}
