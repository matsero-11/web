"use client";
import { useRouter } from "next/navigation";
import HomeScreen from "@/components/HomeScreen";

export default function HomePage() {
  const router = useRouter();
  return <HomeScreen onNavigate={(id) => router.push(`/herramientas/${id}`)} />;
}
