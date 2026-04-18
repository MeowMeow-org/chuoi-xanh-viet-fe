import { redirect } from "next/navigation";

export default function FarmerOrdersPage() {
  redirect("/farmer/marketplace?tab=orders");
}
