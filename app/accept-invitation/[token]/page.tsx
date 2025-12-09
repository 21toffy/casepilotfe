import AcceptInvitationPage from "./ClientComponent"

export async function generateStaticParams() {
  // Return a placeholder token for static export
  // The actual token will be handled dynamically on the client side
  return [{ token: 'placeholder' }]
}

export default function Page() {
  return <AcceptInvitationPage />
}
