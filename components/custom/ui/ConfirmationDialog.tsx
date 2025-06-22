import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {Loader2} from "lucide-react";

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText: boolean;
    cancelText?: string;
    onConfirm: () => void;
    destructive?: boolean;
    loading?: boolean;
}

export function ConfirmationDialog({
                                       open,
                                       onOpenChange,
                                       title,
                                       description,
                                       confirmText,
                                       cancelText = "Отмена",
                                       onConfirm,
                                       destructive = false,
                                       loading = false,
                                   }: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={destructive ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                {/* Можно добавить спиннер */}
                                {confirmText ? (
                                    <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                    </span>
                                ) : "Delete"}
              </span>
                        ) : (
                            confirmText ? (
                                <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                    </span>
                            ) : "Delete"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}