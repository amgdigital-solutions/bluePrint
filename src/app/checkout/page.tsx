import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  const applicationId = process.env.SQUARE_APPLICATION_ID || "";
  const locationId = process.env.SQUARE_LOCATION_ID || "";
  const environment = process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase() === "production" ? "production" : "sandbox";
  return <CheckoutClient applicationId={applicationId} locationId={locationId} environment={environment} />;
}
