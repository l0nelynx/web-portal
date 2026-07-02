export const BRAND_NAME: string = import.meta.env.VITE_BRAND_NAME || "Cheeze Networks";
export const BRAND_LOGO: string = import.meta.env.VITE_BRAND_LOGO || "";

// Direct t.me link to the Telegram bot. Consumer CTAs ("try free in Telegram")
// and the legal contact channel use this. Empty → Telegram CTAs are hidden.
export const BOT_URL: string = import.meta.env.VITE_BOT_URL || "";

// Legal seller name shown in the public offer / legal documents. Falls back to
// the brand name when the dedicated CI variable is not set.
export const SELLER_NAME: string = import.meta.env.VITE_SELLER_NAME || BRAND_NAME;
