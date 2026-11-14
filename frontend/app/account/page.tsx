import type { Metadata } from "next";
import FamilyCenter from "@/components/family/FamilyCenter";
import "./family.css";

export const metadata: Metadata = {
  title: "My Family | KiddoWorld",
  description:
    "The parent dashboard: manage your family account, child profiles, and follow each child's real learning progress.",
};

export default function AccountPage() {
  return <FamilyCenter />;
}
