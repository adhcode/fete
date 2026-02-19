import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Fete",
  description: "Tips, guides, and stories about event photo sharing.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Fete
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/blog" className="text-gray-900 font-medium">
                Blog
              </Link>
              <Link
                href="https://app.fete.com"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600">
            Tips, guides, and stories about event photo sharing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
            <div className="p-6">
              <div className="text-sm text-purple-600 font-semibold mb-2">
                GUIDES
              </div>
              <h2 className="text-xl font-bold mb-2">
                How to Create the Perfect Event Photo Gallery
              </h2>
              <p className="text-gray-600 mb-4">
                Learn best practices for setting up your event, encouraging guest participation, and creating memorable galleries.
              </p>
              <Link href="/blog/perfect-event-gallery" className="text-purple-600 font-semibold hover:text-purple-700">
                Read more →
              </Link>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
            <div className="p-6">
              <div className="text-sm text-purple-600 font-semibold mb-2">
                TIPS
              </div>
              <h2 className="text-xl font-bold mb-2">
                10 Ways to Encourage Photo Uploads at Your Event
              </h2>
              <p className="text-gray-600 mb-4">
                Simple strategies to get your guests excited about sharing their photos and creating lasting memories.
              </p>
              <Link href="/blog/encourage-uploads" className="text-purple-600 font-semibold hover:text-purple-700">
                Read more →
              </Link>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
            <div className="h-48 bg-gradient-to-br from-pink-400 to-pink-600"></div>
            <div className="p-6">
              <div className="text-sm text-purple-600 font-semibold mb-2">
                STORIES
              </div>
              <h2 className="text-xl font-bold mb-2">
                How Fete Helped Capture 500+ Wedding Moments
              </h2>
              <p className="text-gray-600 mb-4">
                A real story from a couple who used Fete to collect and share photos from their special day.
              </p>
              <Link href="/blog/wedding-success-story" className="text-purple-600 font-semibold hover:text-purple-700">
                Read more →
              </Link>
            </div>
          </article>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">More articles coming soon!</p>
        </div>
      </main>
    </div>
  );
}
