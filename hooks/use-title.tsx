import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

interface TitleStore {
  // Track which document is being edited and what the current value is
  editingTitleId: Id<"documents"> | null;
  editingTitleValue: string;

  // Actions
  setEditing: (documentId: Id<"documents">, value: string) => void;
  updateValue: (value: string) => void;
  clearEditing: () => void;
}

export const useTitle = create<TitleStore>((set) => ({
  editingTitleId: null,
  editingTitleValue: "",

  setEditing: (documentId, value) =>
    set({ editingTitleId: documentId, editingTitleValue: value }),

  updateValue: (value) => set({ editingTitleValue: value }),

  clearEditing: () => set({ editingTitleId: null, editingTitleValue: "" }),
}));
