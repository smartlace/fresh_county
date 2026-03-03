import { MainLayout } from '@/components/layout/main-layout'
import { HeroSection } from '@/components/shop/hero-section'
import { CategoriesSection } from '@/components/shop/categories-section'
import { FeaturedSection } from '@/components/shop/featured-section'
import { WhyChooseUs } from '@/components/shop/why-choose-us'
import { FarmersSection } from '@/components/shop/farmers-section'
import { NewsletterSection } from '@/components/shop/newsletter-section'
import { FAQSection } from '@/components/shop/faq-section'

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <WhyChooseUs />
      <FarmersSection />
      <NewsletterSection />
      <FAQSection />
    </MainLayout>
  )
}
