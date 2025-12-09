/**
 * Authentication Configuration
 * 
 * Set NEXT_PUBLIC_AUTH_ENABLED=false in .env to block all authentication pages
 * Set NEXT_PUBLIC_AUTH_ENABLED=true (or omit) to allow users to access authentication pages
 */

export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'true'
