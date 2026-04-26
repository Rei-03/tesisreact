// app/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard
    router.push("/dashboard");
  }, [router]);

  // Mostrar loading mientras se redirige
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      <div className="text-slate-500">Redirigiendo...</div>
    </div>
  );
}
