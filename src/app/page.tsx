import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

export default async function Home() {
  // Check if the user is authenticated
  const session = await getServerSession();

  // Redirect to database setup page
  redirect("/database");
}
