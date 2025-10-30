import type { CheckoutLinkResponse } from '../api/links';
import type { CheckoutLink } from '@/types/link';

/**
 * Transform CheckoutLinkResponse from backend to CheckoutLink for UI
 * Adds backwards compatibility fields (amount, amountUSD)
 */
export function transformCheckoutLink(response: CheckoutLinkResponse): CheckoutLink {
  // Get first USDC price as default amount (for backwards compatibility)
  const usdcPrice = response.tokenPrices.find(tp => tp.token === 'USDC');
  const usdtPrice = response.tokenPrices.find(tp => tp.token === 'USDT');
  const solPrice = response.tokenPrices.find(tp => tp.token === 'SOL');

  // Default to USDC price, fallback to USDT, then SOL, then 0
  const defaultPrice = usdcPrice?.price || usdtPrice?.price || solPrice?.price || '0';
  const amount = parseFloat(defaultPrice);

  // For USD amount, prefer USDC/USDT (they are stablecoins)
  const amountUSD = response.amountUSDC || response.amountUSDT || amount;

  return {
    ...response,
    amount, // For backwards compatibility (SOL price or first available)
    amountUSD, // For backwards compatibility (USD equivalent)
  };
}

/**
 * Transform array of CheckoutLinkResponse to CheckoutLink[]
 */
export function transformCheckoutLinks(responses: CheckoutLinkResponse[]): CheckoutLink[] {
  return responses.map(transformCheckoutLink);
}
