"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message?: string;
    description?: string;
    loading?: boolean;
    confirmText?: string;
    confirmVariant?: "default" | "destructive";
    variant?: "default" | "destructive";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    description,
    loading = false,
    confirmText = "Confirm",
    confirmVariant,
    variant = "default",
}: ConfirmModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Support both message and description props
    const displayMessage = message || description || "";
    // Support both confirmVariant and variant props
    const buttonVariant = confirmVariant || variant;

    // Combine loading states
    const isBusy = loading || isLoading;

    const handleConfirm = async (e: any) => {
        e.preventDefault();
        if (isBusy) return;

        const result = onConfirm();

        // If onConfirm returns a promise, we handle the loading state locally
        if (result instanceof Promise) {
            setIsLoading(true);
            try {
                await result;
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="z-[100]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-rubik">{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {displayMessage}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isBusy}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isBusy}
                        className={buttonVariant === "destructive"
                            ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600"
                        }
                    >
                        {isBusy ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
