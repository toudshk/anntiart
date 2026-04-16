import {
  LandingFooter,
  LandingHero,
  PicturesGallery,
} from "view/components/Landing";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHero />
      <PicturesGallery />
      <LandingFooter />
    </div>
  );
}
