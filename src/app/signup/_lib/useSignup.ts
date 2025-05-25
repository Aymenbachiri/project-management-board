import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signup } from "@/lib/actions/auth";
import { useState, useTransition } from "react";
import { signupSchema, type SignUp } from "./schema";

type useSignupReturn = {
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isPending: boolean;
  form: UseFormReturn<SignUp>;
  onSubmit: (values: SignUp) => Promise<void>;
};

export function useSignup(): useSignupReturn {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUp>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUp) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await signup(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Account created successfully!");
        setTimeout(() => {
          window.location.replace("/signin");
        }, 1000);
      }
    });
  }

  return {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isPending,
    form,
    onSubmit,
  };
}
