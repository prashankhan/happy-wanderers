/** Short toast / API message when minimum guests exceeds maximum guests. */
export const PRICING_GUESTS_ORDER_TOAST = "Max guests is below minimum";

/** Inline helper under the fields (includes numbers). */
export function pricingGuestsOrderDetail(minGuests: number, maxGuests: number): string {
  return `Minimum is ${minGuests} and maximum is ${maxGuests}. Raise max or lower min.`;
}
