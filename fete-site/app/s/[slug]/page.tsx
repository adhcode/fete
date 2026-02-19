import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ShareBundle {
  id: string;
  slug: string;
  caption: string | null;
  createdAt: string;
  event: {
    id: string;
    name: string;
    code: string;
  };
  items: Array<{
    id: string;
    sortOrder: number;
    photo: {
      id: string;
      caption: string | null;
      largeUrl: string | null;
      thumbUrl: string | null;
      width: number | null;
      height: number | null;
    };
  }>;
}

async function getShareBundle(slug: string): Promise<ShareBundle | null> {
  try {
    const res = await fetch(`${API_URL}/api/share/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getShareBundle(slug);

  if (!bundle) {
    return {
      title: "Share Not Found",
    };
  }

  const title = bundle.caption
    ? `${bundle.caption} - ${bundle.event.name}`
    : `Photos from ${bundle.event.name}`;
  const description = `Check out ${bundle.items.length} photos from ${bundle.event.name} on Fete`;
  const firstPhoto = bundle.items[0]?.photo;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: firstPhoto?.largeUrl ? [{ url: firstPhoto.largeUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: firstPhoto?.largeUrl ? [firstPhoto.largeUrl] : [],
    },
  };
}

export default async function ShareBundlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await getShareBundle(slug);

  if (!bundle) {
    notFound();
  }

  const sortedPhotos = [...bundle.items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Fete
            </Link>
            <Link
              href={`/e/${bundle.event.code}`}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View Event Gallery →
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {bundle.event.name}
          </h1>
          {bundle.caption && (
            <p className="text-xl text-gray-600">{bundle.caption}</p>
          )}
          <p className="text-gray-500 mt-2">
            {bundle.items.length} {bundle.items.length === 1 ? "photo" : "photos"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {sortedPhotos.map((item) => (
            <Link
              key={item.id}
              href={`/p/${item.photo.id}`}
              className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden hover:ring-4 hover:ring-purple-500 transition"
            >
              {item.photo.thumbUrl && (
                <Image
                  src={item.photo.thumbUrl}
                  alt={item.photo.caption || "Event photo"}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              )}
              {item.photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {item.photo.caption}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href={`/e/${bundle.event.code}`}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            View All Event Photos
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: bundle.caption || `Photos from ${bundle.event.name}`,
                  text: `Check out these ${bundle.items.length} photos from ${bundle.event.name}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
          >
            Share Bundle
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to create your own event photo gallery?
          </p>
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Get Started with Fete
          </Link>
        </div>
      </main>
    </div>
  );
}
