import CaseDetailPage from "./ClientComponent"

export async function generateStaticParams() {
  // Return a placeholder id for static export
  // The actual id will be handled dynamically on the client side
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <CaseDetailPage />
}
