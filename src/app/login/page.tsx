import { istRegistrierungOffen } from "@/lib/config";
import { LoginForm } from "./LoginForm";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const nextParam = searchParams.next;
  const next = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/uebersicht";

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <LoginForm next={next} registrierungOffen={istRegistrierungOffen()} />
    </main>
  );
}
