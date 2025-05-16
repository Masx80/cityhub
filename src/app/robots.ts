import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sexcityhub.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/admin-access/',
        '/api/',
        '/auth/',
        '/settings/',
        '/edit-video/',
        '/onboarding/',
        '/notifications/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
} 