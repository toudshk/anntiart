import {
  LandingFooter,
  LandingHero,
  PicturesGallery,
} from "view/components/Landing";
import type { LandingArtworkBundle } from "view/lib/landing-artworks";

export function LandingPage(bundle: LandingArtworkBundle) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHero />
      <PicturesGallery
        works={bundle.works}
        collection={bundle.collection}
        workMeta={bundle.workMeta}
        collectionMeta={bundle.collectionMeta}
      />
      <LandingFooter />
    </div>
  );
}
