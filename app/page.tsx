import type { Metadata } from "next";
import HomeClient from "../components/HomeClient";

export const metadata: Metadata = {
  title: "ShoreDrop — Beach Day Delivery",
  description:
    "On-demand delivery of beach chairs, umbrellas, coolers, snacks, and drinks in Virginia Beach and Panama City Beach (Bay County).",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeClient />;
}
