"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { Id } from "@/convex/_generated/dataModel";
import { useDeleteFiles } from "@/hooks/use-delete-files";

interface EditorProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  documentId: Id<"documents">;
}

export default function Editor({
  onChange,
  initialContent,
  editable,
  documentId,
}: EditorProps) {
  const { resolvedTheme } = useTheme();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { edgestore } = useEdgeStore();
  const { deleteFile, extractFileUrls, replaceFile } = useDeleteFiles();

  const previousFilesRef = useRef<Set<string>>(new Set());

  const currentDocumentIdRef = useRef<Id<"documents">>(documentId);

  //  Track if this is the first change after loading a document
  const isFirstChangeRef = useRef(true);

  // Track the block being replaced
  const replacementContextRef = useRef<{
    blockId?: string;
    oldUrl?: string;
  }>({});

  const handleUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");

    // If we're replacing a file, delete the old one first
    if (replacementContextRef.current.oldUrl) {
      console.log("Replacing file:", replacementContextRef.current.oldUrl);
      await replaceFile(replacementContextRef.current.oldUrl);
      previousFilesRef.current.delete(replacementContextRef.current.oldUrl);
      replacementContextRef.current = {}; // Reset
    }

    const response = isImage
      ? await edgestore.publicImages.upload({ file })
      : await edgestore.publicFiles.upload({ file });

    previousFilesRef.current.add(response.url);
    console.log("✅ File uploaded:", response.url);

    return response.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    isEditable: editable ?? true,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  useEffect(() => {
    editor.isEditable = editable ?? true;
  }, [editable, editor]);

  // Custom file replacement handler
  useEffect(() => {
    if (!editor) return;

    // Listen for block updates to detect replacements
    const unsubscribe = editor.onChange(() => {
      const currentDoc = editor.document;

      // Check if any image/file blocks have changed their URL
      const traverse = (block: PartialBlock) => {
        if (
          (block.type === "image" || block.type === "file") &&
          block.props &&
          "url" in block.props
        ) {
          const currentUrl = block.props.url as string;

          // If this block previously had a different URL, it's a replacement
          // (This is a simplified check - in production you'd want more robust tracking)
          if (currentUrl && previousFilesRef.current.has(currentUrl)) {
            // File is already tracked, no replacement
          }
        }

        if (block.children) {
          block.children.forEach(traverse);
        }
      };

      currentDoc.forEach(traverse);
    });

    return () => {
      unsubscribe();
    };
  }, [editor]);

  const handleChange = () => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      console.log("handleChange triggered");
      console.log("isFirstChangeRef:", isFirstChangeRef.current);
      console.log("currentDocumentIdRef:", currentDocumentIdRef.current);
      console.log("documentId:", documentId);

      // Double-check document hasn't changed during timeout
      if (currentDocumentIdRef.current !== documentId) {
        console.warn("⚠️ Document changed during timeout, aborting");
        return; // Don't save OR delete anything
      }
      //  Skip cleanup on first change after document load
      if (isFirstChangeRef.current) {
        console.log("Skipping cleanup (first change)");
        isFirstChangeRef.current = false;
        onChange?.(JSON.stringify(editor.document, null, 2));
        return;
      }

      const content = JSON.stringify(editor.document, null, 2);
      const currentFilesArray = extractFileUrls(content);
      const currentFiles = new Set(currentFilesArray);

      console.log("Previous files:", Array.from(previousFilesRef.current));
      console.log("Current files:", Array.from(currentFiles));

      const removedFiles = Array.from(previousFilesRef.current).filter(
        (url) => !currentFiles.has(url)
      );

      console.log("Removed files:", removedFiles);

      if (removedFiles.length > 0) {
        console.log(`Cleaning up ${removedFiles.length} removed file(s)`);

        for (const url of removedFiles) {
          await deleteFile(url);
          previousFilesRef.current.delete(url);
        }
      }

      // Update tracked files
      previousFilesRef.current = currentFiles;
      onChange?.(content);
    }, 300);
  };

  //  Initialize tracked files when document ID changes
  useEffect(() => {
    console.log("📄 Document changed, resetting state");
    clearTimeout(timeoutRef.current);
    // Reset state ONLY when switching to a different document
    currentDocumentIdRef.current = documentId;
    isFirstChangeRef.current = true;

    if (initialContent) {
      try {
        const blocks = JSON.parse(initialContent) as PartialBlock[];
        const fileUrlsArray = extractFileUrls(JSON.stringify(blocks));
        previousFilesRef.current = new Set(fileUrlsArray);
        console.log(
          "📂 Initialized with files:",
          Array.from(previousFilesRef.current)
        );
      } catch (error) {
        console.error("Failed to parse initial content:", error);
        previousFilesRef.current = new Set();
      }
    } else {
      previousFilesRef.current = new Set();
    }
  }, [documentId]); // ONLY depend on documentId, NOT initialContent

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div>
      <BlockNoteView
        onChange={handleChange}
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}
