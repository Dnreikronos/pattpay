import Image from "next/image";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  accentColor: string;
}

function StatCard({ title, value, icon, accentColor }: StatCardProps) {
  return (
    <div
      className="relative bg-surface border-4 p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: accentColor,
        boxShadow: `6px 6px 0 0 ${accentColor}33`,
      }}
    >
      {/* Pixel grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          opacity: 0.3,
        }}
      />

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor})`,
          opacity: 0.3,
        }}
      />

      {/* Corner pixel decorations */}
      <div
        className="absolute top-0 right-0 w-2 h-2 pointer-events-none"
        style={{ backgroundColor: accentColor, opacity: 0.4 }}
      />
      <div
        className="absolute bottom-0 left-0 w-2 h-2 pointer-events-none"
        style={{ backgroundColor: accentColor, opacity: 0.4 }}
      />

      {/* Card content - horizontal split */}
      <div className="relative flex items-center justify-between gap-4">
        {/* Left side - Text content */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-sans font-bold text-fg">{title}</h3>
          <p
            className="text-5xl md:text-6xl font-display font-bold leading-none"
            style={{ color: accentColor }}
          >
            {value}
          </p>
        </div>

        {/* Right side - Pixel art image */}
        <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
          <Image
            src={icon}
            alt={title}
            width={96}
            height={96}
            className="pixelated w-full h-full object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground" style={{ fontFamily: "var(--font-press-start)", fontWeight: 400, fontSize: "2.5rem" }}>
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Subscriptions"
          value="0"
          icon="/person1.png"
          accentColor="#4F46E5"
        />
        <StatCard
          title="Total Revenue"
          value="0 SOL"
          icon="/person2.png"
          accentColor="#F2B94B"
        />
        <StatCard
          title="Payments Today"
          value="0"
          icon="/person3.png"
          accentColor="#818CF8"
        />
      </div>
    </div>
  );
}
