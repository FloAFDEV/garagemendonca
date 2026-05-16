import { redirect } from "next/navigation";

// L'authentification se fait désormais sur /login
export default function AdminLoginRedirect() {
  redirect("/login");
}
