import {
  LandingFooter,
  LandingHero,
  PicturesGallerySsr,
} from "view/components/Landing";
import type { LandingArtworkBundle } from "view/lib/landing-artworks";

export function LandingPage(bundle: LandingArtworkBundle) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHero />
      <PicturesGallerySsr
        works={bundle.works}
        collection={bundle.collection}
        workMeta={bundle.workMeta}
        collectionMeta={bundle.collectionMeta}
      />
      <LandingFooter />
    </div>
  );
}
