import Navbar from "@/components/Navbar";
import { ForceTheme } from "@/components/providers/force-theme";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ForceTheme theme="light" />
      <Navbar />
      {children}
    </>
  );
}
