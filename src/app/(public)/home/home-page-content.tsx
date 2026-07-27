import HomeHashScroll from '@/components/home-hash-scroll'
import HomeSectionNav from '@/components/home-section-nav'
import { loadPublicConfigWithFallback } from '@/lib/public-config'
import HomeBannerFrame from './home-banner-frame'
import ProductIntro from './product-intro'
import TourFaq from './tour-faq'
import TourImportantInfo from './tour-important-info'
import TourInclusions from './tour-inclusions'
import TourItinerary from './tour-itinerary'
import TourMeetingPoint from './tour-meeting-point'
import TourOverview from './tour-overview'
import TravelerReviews from './traveler-reviews'

export default async function HomePageContent() {
  const { tourConfig } = await loadPublicConfigWithFallback()
  const { louvreTour, faqs, importantInfo, bannerPhotos } = tourConfig

  return (
    <>
      <HomeHashScroll />
      <HomeBannerFrame bannerPhotos={bannerPhotos} />
      <div className="flex flex-col lg:col-span-4">
        <HomeSectionNav />
        <ProductIntro louvreTour={louvreTour} />
        <TourOverview />
        <TourInclusions />
        <TourItinerary louvreTour={louvreTour} />
        <TourMeetingPoint />
        <TourImportantInfo importantInfo={importantInfo} />
        <TourFaq faqs={faqs} />
        <TravelerReviews louvreTour={louvreTour} />
      </div>
    </>
  )
}
