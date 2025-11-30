import CaseDetailPage from "./ClientComponent"

// Regular catch-all - only matches /cases/123, not /cases
// For static export, we must return at least one param object
export async function generateStaticParams() {
  // Return placeholder - actual routes handled client-side via Next.js router
  return [{ id: ['placeholder'] }]
}

export default function Page() {
  return <CaseDetailPage />
}
