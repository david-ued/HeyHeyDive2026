import {HomeHero} from '@/components/marketing/sections/hero';
import {BrandTagline} from '@/components/marketing/sections/brand-tagline';
import {DiveSiteCards} from '@/components/marketing/sections/dive-site-cards';
import {SeasonalTrips} from '@/components/marketing/sections/seasonal-trips';
import {DualCourses} from '@/components/marketing/sections/dual-courses';
import {Newsletter} from '@/components/marketing/sections/newsletter';

export default async function HomePage() {
  return (
    <>
      <HomeHero />
      <BrandTagline />
      <DiveSiteCards />
      <SeasonalTrips />
      <DualCourses />
      <Newsletter />
    </>
  );
}
