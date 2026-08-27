import { useContext } from "react";
import { WeddingContext } from "../context/WeddingContext";

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) {
    throw new Error("useWedding must be used within a WeddingProvider");
  }
  return ctx;
}
