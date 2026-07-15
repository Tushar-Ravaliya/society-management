import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/form/FormField";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import type { LoginPayload } from "../../../types/auth.types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginPayload) => {
    try {
      const response = await authApi.login(data);
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success("Successfully logged in!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="your@email.com"
          {...register("email")}
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <Input
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />
      </FormField>

      <Button type="submit" className="w-full mt-5 py-2.5 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20" loading={isSubmitting}>
        Sign in
      </Button>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <p className="text-[10px] text-charcoal-muted/70 text-center mb-4 uppercase tracking-widest font-bold">
          Quick Access (Demo)
        </p>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary-light/40 transition-all duration-300 cursor-pointer select-none group"
            onClick={() => {
              setValue("email", "admin@society.com");
              setValue("password", "Password@123");
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary group-hover:scale-105 duration-300">Admin</span>
            <span className="text-[9px] text-charcoal-muted/70 mt-0.5">Full access</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border border-slate-100 hover:border-warning/30 hover:bg-amber-50/40 transition-all duration-300 cursor-pointer select-none group"
            onClick={() => {
              setValue("email", "committee@society.com");
              setValue("password", "Password@123");
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-warning group-hover:scale-105 duration-300">Committee</span>
            <span className="text-[9px] text-charcoal-muted/70 mt-0.5">Management</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border border-slate-100 hover:border-success/30 hover:bg-emerald-50/40 transition-all duration-300 cursor-pointer select-none group"
            onClick={() => {
              setValue("email", "john@society.com");
              setValue("password", "Password@123");
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-success group-hover:scale-105 duration-300">Resident</span>
            <span className="text-[9px] text-charcoal-muted/70 mt-0.5">A-101 Unit</span>
          </button>
        </div>
      </div>
    </form>
  );
};
