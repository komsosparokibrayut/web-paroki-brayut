"use client";

import { useTransition } from "react";
import { createContext, useContext, ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  startTransition: (callback: () => Promise<void> | void) => Promise<void>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isPending, startReactTransition] = useTransition();

  const startTransition = async (callback: () => Promise<void> | void) => {
    startReactTransition(() => {
      const result = callback();
      if (result instanceof Promise) {
        // We handle the promise resolution via the transition state
      }
    });
  };

  return (
    <LoadingContext.Provider value={{ isLoading: isPending, startTransition }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
