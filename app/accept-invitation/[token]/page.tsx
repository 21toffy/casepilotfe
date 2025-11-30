import AcceptInvitationPage from "./ClientComponent"

// Required for static export with dynamic routes
export function generateStaticParams(): Array<{ token: string }> {
  // Return empty array - this route will be handled client-side
  // The actual token will be read from the URL at runtime
  return [{ token: "" }]
}

export default function Page() {
  return <AcceptInvitationPage />
}
