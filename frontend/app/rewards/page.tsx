import type { Metadata } from "next";
import RewardsCenter from "@/components/rewards/RewardsCenter";
import "./rewards.css";

export const metadata: Metadata = {
  title: "My Rewards | KiddoWorld",
  description:
    "Stars, XP, levels and badges collected from Typing Academy, English World and Learning Games — one friendly trophy room.",
};

export default function RewardsPage() {
  return <RewardsCenter />;
}
