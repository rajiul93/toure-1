import type { PublicBlogDetail } from '@/lib/blog-detail'
import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-config'
import { getDefaultSiteSeoSettingsInput } from '@/lib/site-seo.defaults'
import { resolveSiteSeoConfig } from '@/lib/site-seo.merge'
import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service'
import { SITE } from '@/lib/site-config'
import type { ResolvedSiteSeoConfig, SeoPageKey } from '@/lib/site-seo.types'
import { SEO_PAGE_PATHS } from '@/lib/site-seo.types'

type BuildPageMetadataOptions = {
  title: string
  description: string
  path: string
  image?: string
  imageAlt?: string
  type?: 'website' | 'article'
  keywords?: string[]
}

function resolveImage(
  seo: ResolvedSiteSeoConfig,
  image?: string,
  imageAlt?: string,
): { url: string; alt: string; width: number; height: number } {
  const url = image || seo.openGraph.defaultImage.url
  const alt = imageAlt || seo.openGraph.defaultImage.alt_text

  return {
    url,
    alt,
    width: seo.openGraph.defaultImage.width,
    height: seo.openGraph.defaultImage.height,
  }
}

export function buildPageMetadata(
  seo: ResolvedSiteSeoConfig,
  siteBrandFull: string,
  options: BuildPageMetadataOptions,
): Metadata {
  const title =
    options.path === '/'
      ? options.title
      : options.title.includes('|')
        ? options.title
        : `${options.title} | ${siteBrandFull}`

  const image = resolveImage(seo, options.image, options.imageAlt)
  const keywords = options.keywords ?? seo.global.defaultKeywords

  return {
    title,
    description: options.description,
    keywords,
    alternates: {
      canonical: options.path,
    },
    robots: {
      index: seo.global.robotsIndex,
      follow: seo.global.robotsFollow,
    },
    openGraph: {
      type: options.type ?? 'website',
      locale: seo.openGraph.locale,
      url: options.path,
      siteName: seo.openGraph.siteName || siteBrandFull,
      title,
      description: options.description,
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: seo.twitter.card,
      title,
      description: options.description,
      images: [image.url],
      ...(seo.twitter.site ? { site: seo.twitter.site } : {}),
      ...(seo.twitter.creator ? { creator: seo.twitter.creator } : {}),
    },
  }
}

export async function createSeoPageMetadata(
  pageKey: SeoPageKey,
  overrides?: Partial<BuildPageMetadataOptions>,
): Promise<Metadata> {
  const [seo, site] = await Promise.all([getSiteSeoFromDB(), getSiteConfigFromDB()])
  const page = seo.pages[pageKey]
  const path = overrides?.path ?? SEO_PAGE_PATHS[pageKey]
  const pageImage = page.ogImage.url || seo.openGraph.defaultImage.url

  return buildPageMetadata(seo, site.brand.full, {
    title: overrides?.title ?? page.title,
    description: overrides?.description ?? page.description,
    path,
    image: overrides?.image ?? pageImage,
    imageAlt:
      overrides?.imageAlt ??
      (page.ogImage.alt_text || seo.openGraph.defaultImage.alt_text),
    keywords: overrides?.keywords ?? page.keywords,
    type: overrides?.type,
  })
}

export async function createBlogPostMetadata(blog: PublicBlogDetail): Promise<Metadata> {
  const [seo, site] = await Promise.all([getSiteSeoFromDB(), getSiteConfigFromDB()])

  const title = blog.metaTitle || blog.title
  const description = blog.metaDescription || blog.shortDescription
  const ogTitle = blog.fbMetaTitle || title
  const ogDescription = blog.fbMetaDescription || description
  const ogImage = blog.fbMetaImageUrl || blog.metaImageUrl || blog.featuredImageUrl
  const ogImageAlt = blog.fbMetaImageAlt || blog.metaImageAlt || blog.featuredImageAlt || blog.title
  const path = `/blog/${blog.slug}`
  const formattedOgTitle = ogTitle.includes('|') ? ogTitle : `${ogTitle} | ${site.brand.full}`

  const base = buildPageMetadata(seo, site.brand.full, {
    title,
    description,
    path,
    image: ogImage,
    imageAlt: ogImageAlt,
    keywords: blog.keywords.length > 0 ? blog.keywords : undefined,
    type: 'article',
  })

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      title: formattedOgTitle,
      description: ogDescription,
      publishedTime: blog.publishDate,
      modifiedTime: blog.updatedAt,
      tags: blog.tags,
      images: [
        {
          url: ogImage,
          width: seo.openGraph.defaultImage.width,
          height: seo.openGraph.defaultImage.height,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      ...base.twitter,
      title: formattedOgTitle,
      description: ogDescription,
      images: [ogImage],
    },
  }
}

export async function createRootSiteMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([getSiteSeoFromDB(), getSiteConfigFromDB()])
  const home = seo.pages.home

  const verification: Metadata['verification'] = {}
  if (seo.global.googleSiteVerification) {
    verification.google = seo.global.googleSiteVerification
  }
  if (seo.global.bingSiteVerification) {
    verification.other = {
      ...(verification.other ?? {}),
      'msvalidate.01': seo.global.bingSiteVerification,
    }
  }
  if (seo.global.yandexVerification) {
    verification.yandex = seo.global.yandexVerification
  }

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: home.title,
      template: seo.global.titleTemplate,
    },
    description: home.description,
    keywords: seo.global.defaultKeywords,
    robots: {
      index: seo.global.robotsIndex,
      follow: seo.global.robotsFollow,
    },
    ...(Object.keys(verification).length > 0 ? { verification } : {}),
    openGraph: {
      type: 'website',
      locale: seo.openGraph.locale,
      siteName: seo.openGraph.siteName || site.brand.full,
      title: home.title,
      description: home.description,
      images: [
        {
          url: home.ogImage.url || seo.openGraph.defaultImage.url,
          width: seo.openGraph.defaultImage.width,
          height: seo.openGraph.defaultImage.height,
          alt: home.ogImage.alt_text || seo.openGraph.defaultImage.alt_text,
        },
      ],
    },
    twitter: {
      card: seo.twitter.card,
      title: home.title,
      description: home.description,
      images: [home.ogImage.url || seo.openGraph.defaultImage.url],
      ...(seo.twitter.site ? { site: seo.twitter.site } : {}),
      ...(seo.twitter.creator ? { creator: seo.twitter.creator } : {}),
    },
  }
}

const defaultSeo = resolveSiteSeoConfig(getDefaultSiteSeoSettingsInput())

/** Static fallback for routes that still use sync metadata during build. */
export function createPageMetadata(options: BuildPageMetadataOptions): Metadata {
  return buildPageMetadata(defaultSeo, SITE.brand.full, options)
}

/** Auth and dashboard routes — never index even if global robots allow. */
export function createPrivatePageMetadata(options: BuildPageMetadataOptions): Metadata {
  const base = buildPageMetadata(defaultSeo, SITE.brand.full, options)
  return {
    ...base,
    robots: { index: false, follow: false },
  }
}

export function createNotFoundBlogMetadata(): Metadata {
  return {
    title: 'Article not found',
    robots: { index: false, follow: false },
  }
}
