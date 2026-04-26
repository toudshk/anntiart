import {
  LandingFooter,
  LandingHero,
  PicturesGallerySsr,
} from "view/components/Landing";
import { HERO_BLOCK_ART_STRIP } from "view/constants/hero-block";
import type { LandingArtworkBundle } from "view/lib/landing-artworks";

export function LandingPage(bundle: LandingArtworkBundle) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHero artStrip={HERO_BLOCK_ART_STRIP} />
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
