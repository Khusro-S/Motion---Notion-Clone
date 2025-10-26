"use client";

import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/modals/Settings-Modal";
import CoverImageModal from "@/components/modals/Cover-Image-Modal";

export default function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <SettingsModal />
      <CoverImageModal />
    </>
  );
}
