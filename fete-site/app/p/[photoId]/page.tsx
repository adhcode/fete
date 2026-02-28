import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Photo {
  id: string;
  caption: string | null;
  status: string;
  approved: boolean;
  width: number | null;
  height: number | null;
  largeUrl: string | null;
  thumbUrl: string | null;
  createdAt: string;
  event: {
    id: string;
    name: string;
    code: string;
  };
}

async function getPhoto(photoId: string): Promise<Photo | null> {
  try {
    const res = await fetch(`${API_URL}/api/photos/${photoId}`, {
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
  params: Promise<{ photoId: string }>;
}): Promise<Metadata> {
  const { photoId } = await params;
  const photo = await getPhoto(photoId);

  if (!photo) {
    return {
      title: "Photo Not Found",
    };
  }

  const title = photo.caption
    ? `${photo.caption} - ${photo.event.name}`
    : `Photo from ${photo.event.name}`;
  const description = `Check out this photo from ${photo.event.name} on Fete`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: photo.largeUrl ? [{ url: photo.largeUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: photo.largeUrl ? [photo.largeUrl] : [],
    },
  };
}

export default async function PhotoSharePage({
  params,
}: {
  params: Promise<{ photoId: string }>;
}) {
  const { photoId } = await params;
  const photo = await getPhoto(photoId);

  if (!photo || !photo.largeUrl) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Fete
            </Link>
            <Link
              href={`/e/${photo.event.code}`}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View Event Gallery →
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative w-full" style={{ aspectRatio: `${photo.width}/${photo.height}` }}>
            <Image
              src={photo.largeUrl}
              alt={photo.caption || "Event photo"}
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {photo.event.name}
                </h1>
                {photo.caption && (
                  <p className="text-gray-600 text-lg">{photo.caption}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/e/${photo.event.code}`}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition text-center"
              >
                View All Photos
              </Link>
              <button
                onClick={() => {
                  if (navigator.share && photo.largeUrl) {
                    navigator.share({
                      title: photo.caption || "Event Photo",
                      text: `Check out this photo from ${photo.event.name}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
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
