import type { Metadata } from "next";
import AdminClient from "../../components/admin/AdminClient";

export const metadata: Metadata = {
  title: "Admin — ShoreDrop",
  description: "Internal read-only view of ShoreDrop orders and gear availability.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
