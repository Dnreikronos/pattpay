export default function LoadingPayment() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Order Summary Skeleton */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="bg-surface border-2 border-border rounded-lg p-6 space-y-6 animate-pulse">
            {/* Merchant header skeleton */}
            <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
              <div className="w-12 h-12 bg-border rounded-lg" />
              <div className="h-6 bg-border rounded w-32" />
            </div>

            {/* Product info skeleton */}
            <div className="space-y-3">
              <div className="h-5 bg-border rounded w-3/4" />
              <div className="h-4 bg-border rounded w-full" />
              <div className="h-4 bg-border rounded w-5/6" />
            </div>

            {/* Amount skeleton */}
            <div className="pt-4 border-t-2 border-border space-y-2">
              <div className="h-8 bg-border rounded w-1/2" />
              <div className="h-4 bg-border rounded w-1/3" />
            </div>
          </div>
        </div>

        {/* Right Column - Payment Form Skeleton */}
        <div className="space-y-6">
          <div className="bg-surface border-2 border-border rounded-lg p-6 space-y-6 animate-pulse">
            {/* Header */}
            <div className="space-y-2">
              <div className="h-6 bg-border rounded w-1/2" />
              <div className="h-4 bg-border rounded w-3/4" />
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-border rounded w-1/4" />
                <div className="h-12 bg-border rounded w-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-border rounded w-1/4" />
                <div className="h-12 bg-border rounded w-full" />
              </div>
            </div>

            {/* Token selector skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-border rounded w-1/3" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-border rounded" />
                <div className="h-20 bg-border rounded" />
              </div>
            </div>

            {/* Wallet button skeleton */}
            <div className="h-14 bg-border rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
