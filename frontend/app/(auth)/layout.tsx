import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-text.svg"
              alt="PattPay"
              width={180}
              height={40}
              className="pixelated"
              priority
            />
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted">
          By continuing, you agree to PattPay&apos;s Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}
