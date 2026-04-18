import { LandingPage } from "view/pages/Landing/LandingPage";
import { getLandingArtworkBundle } from "view/lib/landing-artworks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const bundle = await getLandingArtworkBundle();
  return <LandingPage {...bundle} />;
}
