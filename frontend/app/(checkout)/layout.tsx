import { ForceTheme } from "@/components/providers/force-theme";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ForceTheme theme="light" />
      {children}
    </div>
  );
}
