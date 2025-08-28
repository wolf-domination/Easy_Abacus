import { createContext, useContext, useState } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const [onModalClose, setOnModalClose] = useState(null);

  const closeModal = () => {
    if (onModalClose) onModalClose();
    setModalContent(null);
    setOnModalClose(null);
  };

  const value = { modalContent, setModalContent, setOnModalClose, closeModal };
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  return useContext(ModalContext);
}

// Optional simple modal
export function Modal() {
  const ctx = useModal();
  if (!ctx || !ctx.modalContent) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={ctx.closeModal}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
        display: "grid", placeItems: "center", zIndex: 1000,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
        {ctx.modalContent}
      </div>
    </div>
  );
}
