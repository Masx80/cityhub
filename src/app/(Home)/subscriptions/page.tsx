import { redirect } from "next/navigation";

export default function OldSubscriptionsPage() {
  // Redirect to the new URL
  redirect("/all-channels");
}
