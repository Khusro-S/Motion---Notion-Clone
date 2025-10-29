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
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

  // Query file count
  const fileCountData = useQuery(api.documents.getUserFileCount);

  const previousFilesRef = useRef<Set<string>>(new Set());

  // Track uploads in current session to prevent exceeding limit
  const sessionUploadCountRef = useRef(0);

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

    // Define file size limits (in bytes)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Check file limit BEFORE upload (unless replacing)
    if (!replacementContextRef.current.oldUrl) {
      // Wait for file count data if not yet loaded
      if (!fileCountData) {
        toast.error("Loading file count, please try again in a moment.");
        return "";
      }

      // Calculate current file count including session uploads
      const currentFileCount =
        fileCountData.count + sessionUploadCountRef.current;

      if (currentFileCount >= fileCountData.limit) {
        toast.error(
          `File limit reached. Maximum ${fileCountData.limit} files allowed for demo accounts.`
        );
        return "";
      }
    }

    // Check file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      // ✅ Show toast notification
      toast.error(
        `File too large: ${fileSizeMB}MB (max: ${maxSizeMB}MB for ${
          isImage ? "images" : "files"
        })`
      );

      // throw new Error(`File size exceeds maximum allowed size`);
      return "";
    }

    // If we're replacing a file, delete the old one first
    if (replacementContextRef.current.oldUrl) {
      console.log("Replacing file:", replacementContextRef.current.oldUrl);
      await replaceFile(replacementContextRef.current.oldUrl);
      previousFilesRef.current.delete(replacementContextRef.current.oldUrl);
      replacementContextRef.current = {}; // Reset
    }

    try {
      const response = isImage
        ? await edgestore.publicImages.upload({ file })
        : await edgestore.publicFiles.upload({ file });

      previousFilesRef.current.add(response.url);

      // Increment session upload count only for new uploads (not replacements)
      if (!replacementContextRef.current.oldUrl) {
        sessionUploadCountRef.current += 1;
      }

      console.log("✅ File uploaded:", response.url);
      console.log("Session upload count:", sessionUploadCountRef.current);

      return response.url;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file. Please try again.");
      return "";
    }
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
          // Decrement session upload count when files are deleted
          if (sessionUploadCountRef.current > 0) {
            sessionUploadCountRef.current -= 1;
          }
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

    // Reset session upload count when switching documents
    sessionUploadCountRef.current = 0;

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
