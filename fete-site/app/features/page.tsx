import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features - Fete",
  description: "Discover all the features that make Fete the best event photo sharing platform.",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Fete
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/features" className="text-gray-900 font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Everything you need for event photos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make photo sharing at events effortless and fun.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Direct Camera Upload</h3>
            <p className="text-gray-600 text-lg">
              Guests can capture and upload photos directly from their phone camera. No app download required.
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Real-Time Gallery</h3>
            <p className="text-gray-600 text-lg">
              Photos appear instantly in the gallery. Everyone at the event can see new uploads as they happen.
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Photo Approval</h3>
            <p className="text-gray-600 text-lg">
              Optional moderation workflow. Review and approve photos before they appear in the public gallery.
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Easy Sharing</h3>
            <p className="text-gray-600 text-lg">
              Share individual photos or create curated bundles. Perfect for social media with beautiful OG previews.
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Auto-Optimization</h3>
            <p className="text-gray-600 text-lg">
              Photos are automatically optimized and resized. Fast loading on all devices without quality loss.
            </p>
          </div>

          <div>
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Rate Limiting</h3>
            <p className="text-gray-600 text-lg">
              Set upload limits per guest and per event. Prevent spam and keep your gallery manageable.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Create your first event in minutes. No credit card required.
          </p>
          <Link
            href="https://app.fete.com"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            Create Event
          </Link>
        </div>
      </main>
    </div>
  );
}
