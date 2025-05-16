import { MetadataRoute } from 'next';

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sexcityhub.com';

  // Static routes with their update frequency and priority
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 1,
    },
    {
      url: `${baseUrl}/latest`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/models`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/2257`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/all-channels`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    },
  ];

  // Try to fetch dynamic content for the sitemap
  try {
    // Fetch videos
    const videosResponse = await fetch(`${baseUrl}/api/videos/sitemap`);
    if (videosResponse.ok) {
      const videos = await videosResponse.json();
      videos.forEach((video: any) => {
        routes.push({
          url: `${baseUrl}/watch/${video.id}`,
          lastModified: new Date(video.updatedAt || video.createdAt),
          changeFrequency: 'weekly' as ChangeFrequency,
          priority: 0.8,
        });
      });
    }

    // Fetch channels
    const channelsResponse = await fetch(`${baseUrl}/api/channels/sitemap`);
    if (channelsResponse.ok) {
      const channels = await channelsResponse.json();
      channels.forEach((channel: any) => {
        routes.push({
          url: `${baseUrl}/channel/${channel.id}`,
          lastModified: new Date(channel.updatedAt || channel.createdAt),
          changeFrequency: 'weekly' as ChangeFrequency,
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap content:', error);
    // Continue with static routes if there's an error
  }

  return routes;
} 