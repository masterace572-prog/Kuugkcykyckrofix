import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <LoginForm
      registered={sp.registered === "1"}
      disabled={sp.error === "disabled"}
    />
  );
}
