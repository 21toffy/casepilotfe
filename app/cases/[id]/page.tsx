import CaseDetailPage from "./ClientComponent"

// Required for static export with dynamic routes
export function generateStaticParams(): Array<{ id: string }> {
  // Return empty array - this route will be handled client-side
  // The actual case ID will be read from the URL at runtime
  return [{ id: "" }]
}

export default function Page() {
  return <CaseDetailPage />
}
