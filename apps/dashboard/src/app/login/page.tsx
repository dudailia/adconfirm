"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">AC</span>
          </div>
          <span className="font-semibold text-white text-lg">AdConfirm</span>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h1 className="text-xl font-semibold text-white mb-1">Sign in</h1>
          <p className="text-sm text-muted-fg mb-6">Enter your credentials to access the dashboard</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
            <Button type="submit" loading={loading} className="w-full mt-2">Sign in</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
