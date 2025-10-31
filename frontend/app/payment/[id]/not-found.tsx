import Link from "next/link";

export default function PaymentNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface border-2 border-border rounded-lg p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-display text-lg text-foreground">
            Payment Link Not Found
          </h1>
          <p className="text-sm text-muted font-mono">
            This payment link may be inactive, expired, or does not exist.
          </p>
        </div>

        {/* Details */}
        <div className="bg-background border border-border rounded p-4 space-y-2 text-left">
          <p className="text-xs text-muted font-mono">
            Common reasons:
          </p>
          <ul className="text-xs text-muted font-mono space-y-1 ml-4 list-disc">
            <li>The link was deactivated by the merchant</li>
            <li>The link has expired</li>
            <li>The URL is incorrect or incomplete</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-600
                     text-white font-mono text-sm rounded-lg
                     shadow-[4px_4px_0_0_rgba(79,70,229,0.3)]
                     hover:-translate-x-[2px] hover:-translate-y-[2px]
                     active:shadow-[2px_2px_0_0_rgba(79,70,229,0.3)]
                     active:translate-x-[1px] active:translate-y-[1px]
                     transition-all duration-150"
          >
            Go Back
          </button>

          <Link
            href="/"
            className="block w-full py-3 px-4 bg-surface hover:bg-background
                     text-foreground font-mono text-sm rounded-lg
                     border-2 border-border
                     transition-colors duration-150"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted font-mono">
          Need help? Contact the merchant who sent you this link.
        </p>
      </div>
    </div>
  );
}
