import { MetadataRoute } from 'next'
import { getAllPosts } from "@/features/news/actions/posts"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.parokibrayut.org"
  
  const allPosts = await getAllPosts().catch(() => [])

  const postUrls = allPosts
    .filter((post) => post.published)
    .map((post) => ({
      url: `${baseUrl}/artikel/${post.categories?.[0] || 'berita'}/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  const staticRoutes = [
    '',
    '/profil',
    '/profil/sejarah',
    '/profil/wilayah',
    '/profil/pastor',
    '/jadwal-misa',
    '/galeri',
    '/artikel',
    '/gereja',
    '/layanan-inti',
    '/contact',
    '/donasi'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...staticRoutes, ...postUrls]
}
