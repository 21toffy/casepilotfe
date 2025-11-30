import AcceptInvitationPage from "./ClientComponent"

// Regular catch-all - only matches /accept-invitation/abc123, not /accept-invitation
// For static export, we must return at least one param object
export async function generateStaticParams() {
  // Return placeholder - actual routes handled client-side via Next.js router
  return [{ token: ['placeholder'] }]
}

export default function Page() {
  return <AcceptInvitationPage />
}
