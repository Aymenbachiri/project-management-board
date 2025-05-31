import { createBoard } from "@/lib/helpers/create-board";
import {
  createBoardSchema,
  type CreateBoardInput,
} from "@/lib/validation/board";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type useCreateBoardProps = {
  onCreateBoard: (newBoard: string, description: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export function useCreateBoard(
  onCreateBoard: useCreateBoardProps["onCreateBoard"],
  onOpenChange: useCreateBoardProps["onOpenChange"],
) {
  const form = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: CreateBoardInput) => {
    try {
      const { name, description } = await createBoard(data);
      onCreateBoard(name, description);
      form.reset();
      onOpenChange(false);
      toast.success("Board created successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create board",
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return {
    form,
    isSubmitting,
    onSubmit,
    handleOpenChange,
  };
}
