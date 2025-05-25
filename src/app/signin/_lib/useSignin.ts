import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useState, useTransition } from "react";
import { login } from "@/lib/actions/auth";
import { toast } from "sonner";
import { signinSchema, type SignIn } from "./schema";

type useSigninReturn = {
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  onSubmit: (values: SignIn) => Promise<void>;
  isPending: boolean;
  form: UseFormReturn<SignIn>;
};

export function useSignin(): useSigninReturn {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignIn>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: SignIn) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await login(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Signed in successfully!");
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 1000);
      }
    });
  }

  return {
    showPassword,
    setShowPassword,
    isSubmitting,
    onSubmit,
    isPending,
    form,
  };
}
