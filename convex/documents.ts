import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Demo limits for portfolio project
const MAX_DOCUMENTS_PER_USER = 10;
const MAX_FILES_PER_USER = 5;

// Helper function to count total files in user's documents
const countUserFiles = async (ctx: any, userId: string): Promise<number> => {
  const documents = await ctx.db
    .query("documents")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  let fileCount = 0;

  for (const doc of documents) {
    // Count cover image
    if (doc.coverImage) {
      fileCount++;
    }

    // Count files in content
    if (doc.content) {
      try {
        const blocks = JSON.parse(doc.content);
        const countFilesInBlocks = (block: any): void => {
          if (
            block.props &&
            ("url" in block.props || "src" in block.props)
          ) {
            fileCount++;
          }
          if (block.children) {
            block.children.forEach(countFilesInBlocks);
          }
        };
        blocks.forEach(countFilesInBlocks);
      } catch (error) {
        // Invalid JSON, skip
      }
    }
  }

  return fileCount;
};

// Query to get user's document count
export const getUserDocumentCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { count: 0, limit: MAX_DOCUMENTS_PER_USER };
    }

    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return { count: documents.length, limit: MAX_DOCUMENTS_PER_USER };
  },
});

// Query to get user's file count
export const getUserFileCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { count: 0, limit: MAX_FILES_PER_USER };
    }

    const userId = identity.subject;
    const count = await countUserFiles(ctx, userId);

    return { count, limit: MAX_FILES_PER_USER };
  },
});

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("You do not have permission to archive this document");
    }

    const recursiveArchive = async (documentId: Id<"documents">) => {
      const childDocuments = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of childDocuments) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        await recursiveArchive(child._id);
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);

    return document;
  },
});

export const getSideBar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

// export const getUserDocuments = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Unauthorized or not logged in");
//     }

//     const userId = identity.subject;

//     const documents = await ctx.db
//       .query("documents")
//       .withIndex("by_user", (q) => q.eq("userId", userId))
//       .collect();

//     return documents;
//   },
// });

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    // Check document limit
    const userDocuments = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (userDocuments.length >= MAX_DOCUMENTS_PER_USER) {
      throw new Error(
        `Document limit reached. Maximum ${MAX_DOCUMENTS_PER_USER} documents allowed for demo accounts.`
      );
    }

    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId: userId,
      isArchived: false,
      isPublished: false,
    });

    return document;
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("You do not have permission to restore this document");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const childDocuments = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of childDocuments) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await ctx.db.patch(args.id, options);

    recursiveRestore(args.id);

    return document;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("You do not have permission to delete this document");
    }

    const recursiveDelete = async (documentId: Id<"documents">) => {
      const childDocuments = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of childDocuments) {
        await ctx.db.delete(child._id);

        await recursiveDelete(child._id);
      }
    };

    await recursiveDelete(args.id);

    const document = await ctx.db.delete(args.id);
    return document;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getDocumentById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    if (document.isPublished && !document.isArchived) {
      return document;
    }

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    if (document.userId !== userId) {
      throw new Error("You do not have permission to view this document");
    }

    return document;
  },
});

export const updateDocumentTitle = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const { id, ...rest } = args; // this way id isnt updated but the rest of the fields are

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("You do not have permission to update this document");
    }

    // If updating content or coverImage, check file limit
    if (rest.content || rest.coverImage) {
      const currentFileCount = await countUserFiles(ctx, userId);

      // Calculate new files being added
      let newFilesCount = 0;

      if (rest.coverImage && rest.coverImage !== existingDocument.coverImage) {
        // Adding a new cover image (existing one will be replaced/deleted)
        if (!existingDocument.coverImage) {
          newFilesCount++;
        }
      }

      if (rest.content) {
        try {
          const newBlocks = JSON.parse(rest.content);
          const oldBlocks = existingDocument.content
            ? JSON.parse(existingDocument.content)
            : [];

          const countFiles = (blocks: any[]): number => {
            let count = 0;
            const traverse = (block: any): void => {
              if (
                block.props &&
                ("url" in block.props || "src" in block.props)
              ) {
                count++;
              }
              if (block.children) {
                block.children.forEach(traverse);
              }
            };
            blocks.forEach(traverse);
            return count;
          };

          const newContentFiles = countFiles(newBlocks);
          const oldContentFiles = countFiles(oldBlocks);
          const contentFileDiff = newContentFiles - oldContentFiles;

          if (contentFileDiff > 0) {
            newFilesCount += contentFileDiff;
          }
        } catch (error) {
          // Invalid JSON, skip check
        }
      }

      if (currentFileCount + newFilesCount > MAX_FILES_PER_USER) {
        throw new Error(
          `File limit reached. Maximum ${MAX_FILES_PER_USER} files allowed for demo accounts.`
        );
      }
    }

    const document = await ctx.db.patch(args.id, { ...rest });

    return document;
  },
});

export const removeIcon = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("You do not have permission to update this document");
    }

    const document = await ctx.db.patch(args.id, { icon: undefined });

    return document;
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized or not logged in");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("You do not have permission to update this document");
    }
    const document = await ctx.db.patch(args.id, { coverImage: undefined });

    return document;
  },
});