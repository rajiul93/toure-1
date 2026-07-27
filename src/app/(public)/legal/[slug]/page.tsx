import LegalPageView from '@/components/legal/legal-page-view'
import LegalStructuredData from '@/components/legal/legal-structured-data'
import { createPageMetadata } from '@/lib/metadata'
import { getLegalPage, LEGAL_PAGE_SLUGS } from '@/lib/legal-pages'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return LEGAL_PAGE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getLegalPage(slug)

  if (!page) {
    return createPageMetadata({
      title: 'Legal',
      description: 'Legal information for Day Tour Paris.',
      path: '/legal',
    })
  }

  return createPageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: page.path,
  })
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params
  const page = getLegalPage(slug)

  if (!page) {
    notFound()
  }

  const site = await getSiteConfigFromDB()

  return (
    <>
      <LegalStructuredData page={page} />
      <LegalPageView
        page={page}
        brandName={site.brand.full}
        whatsappUrl={site.contact.whatsappUrl}
        whatsappLabel={site.contact.whatsappCtaLabel}
      />
    </>
  )
}
