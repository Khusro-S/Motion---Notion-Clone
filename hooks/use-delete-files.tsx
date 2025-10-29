import { useEdgeStore } from "@/lib/edgestore";
import { PartialBlock } from "@blocknote/core";
import { Id } from "@/convex/_generated/dataModel";

export const useDeleteFiles = () => {
  const { edgestore } = useEdgeStore();

  //  Extract file URLs from document content
  const extractFileUrls = (content: string): string[] => {
    try {
      const blocks = JSON.parse(content) as PartialBlock[];
      const urls: string[] = [];

      const traverse = (block: PartialBlock) => {
        // Check for file URLs
        if (
          block.props &&
          "url" in block.props &&
          typeof block.props.url === "string"
        ) {
          urls.push(block.props.url);
        }

        // Check for image sources
        if (
          block.props &&
          "src" in block.props &&
          typeof block.props.src === "string"
        ) {
          urls.push(block.props.src);
        }

        // Recursively check children
        if (block.children) {
          block.children.forEach(traverse);
        }
      };

      blocks.forEach(traverse);
      return urls;
    } catch (error) {
      console.error("Failed to extract file URLs:", error);
      return [];
    }
  };

  //  Delete a single file from EdgeStore
  const deleteFile = async (url: string): Promise<boolean> => {
    try {
      const isImageUrl = url.includes("/publicImages/");
      console.log(`Deleting ${isImageUrl ? "image" : "file"}: ${url}`);

      if (isImageUrl) {
        await edgestore.publicImages.delete({ url });
      } else {
        await edgestore.publicFiles.delete({ url });
      }

      console.log("Deleted file:", url);
      return true;
    } catch (error) {
      console.error("Failed to delete file:", url, error);
      return false;
    }
  };

  // Delete all files from document content
  const deleteContentFiles = async (content?: string): Promise<void> => {
    if (!content) {
      console.log("⚠️ No content to delete files from");
      return;
    }

    const fileUrls = extractFileUrls(content);

    if (fileUrls.length === 0) {
      console.log("No files to delete");
      return;
    }

    console.log(`Deleting ${fileUrls.length} file(s) from content`);

    for (const url of fileUrls) {
      await deleteFile(url);
    }
  };

  // Delete a document and all its files (content + cover + children)
  const deleteDocumentWithFiles = async (
    document: {
      _id: Id<"documents">;
      content?: string;
      coverImage?: string;
    },
    allDocuments?: Array<{
      _id: Id<"documents">;
      parentDocument?: Id<"documents">;
      content?: string;
      coverImage?: string;
      title: string;
    }>
  ): Promise<void> => {
    console.log(" Starting deletion process for document:", document._id);

    const documentsToDelete: Array<{
      _id: Id<"documents">;
      content?: string;
      coverImage?: string;
      title: string;
    }> = [];

    // Get all child documents recursively
    if (allDocuments) {
      const getAllChildren = (
        docId: Id<"documents">
      ): Array<{
        _id: Id<"documents">;
        content?: string;
        coverImage?: string;
        title: string;
      }> => {
        const children = allDocuments.filter(
          (doc) => doc.parentDocument === docId
        );
        let allDescendants: typeof children = [];

        for (const child of children) {
          allDescendants.push(child);
          allDescendants = allDescendants.concat(getAllChildren(child._id));
        }

        return allDescendants;
      };

      const children = getAllChildren(document._id);
      documentsToDelete.push(
        { ...document, title: "Main document" },
        ...children
      );
    } else {
      documentsToDelete.push({ ...document, title: "Main document" });
    }

    console.log(
      `Deleting files from ${documentsToDelete.length} document(s) (including children)`
    );

    // Delete files from all documents (parent + children)
    for (const doc of documentsToDelete) {
      console.log(`Processing document: ${doc.title}`);

      // Delete files from editor content
      await deleteContentFiles(doc.content);

      // Delete cover image
      if (doc.coverImage) {
        console.log("Deleting cover image:", doc.coverImage);
        await deleteFile(doc.coverImage);
      }
    }

    console.log("Finished deleting all files");
  };

  // Replace a file (delete old, return new URL placeholder)
  const replaceFile = async (oldUrl: string): Promise<void> => {
    try {
      await deleteFile(oldUrl);
      console.log("✅ Old file deleted during replacement:", oldUrl);
    } catch (error) {
      console.error("❌ Failed to delete old file during replacement:", error);
    }
  };

  return {
    extractFileUrls,
    deleteFile,
    deleteContentFiles,
    deleteDocumentWithFiles,
    replaceFile,
  };
};
