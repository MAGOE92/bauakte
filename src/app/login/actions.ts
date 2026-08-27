"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { status: "ok" }
  | { status: "check-email" }
  | { status: "error"; message: string };

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "E-Mail-Adresse oder Passwort ist falsch.";
  }
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "Für diese E-Mail-Adresse existiert bereits ein Konto.";
  }
  if (message.includes("Password should be at least")) {
    return "Das Passwort muss mindestens 6 Zeichen lang sein.";
  }
  if (message.includes("Unable to validate email address")) {
    return "Diese E-Mail-Adresse ist ungültig.";
  }
  return message;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return { status: "error", message: "Bitte E-Mail-Adresse und Passwort angeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }
  return { status: "ok" };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return { status: "error", message: "Bitte E-Mail-Adresse und Passwort angeben." };
  }
  if (password.length < 6) {
    return { status: "error", message: "Das Passwort muss mindestens 6 Zeichen lang sein." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
  });

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }
  if (!data.session) {
    return { status: "check-email" };
  }
  return { status: "ok" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
