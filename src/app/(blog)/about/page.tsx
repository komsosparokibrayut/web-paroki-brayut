import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-5xl font-bold mb-8 text-gray-900 dark:text-white">
        About Us
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Welcome to our blog, a modern publishing platform built with cutting-edge technology.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe in sharing knowledge and insights through well-crafted articles. Our platform
          combines the simplicity of markdown with the power of modern web technologies to deliver
          a seamless reading experience.
        </p>

        <h2>Technology Stack</h2>
        <p>
          This blog is powered by:
        </p>
        <ul>
          <li><strong>Next.js 15</strong> - React framework with App Router for optimal performance</li>
          <li><strong>GitHub</strong> - Content storage and version control</li>
          <li><strong>Vercel</strong> - Serverless deployment and hosting</li>
          <li><strong>Markdown</strong> - Simple, portable content format</li>
          <li><strong>TypeScript</strong> - Type-safe development</li>
        </ul>

        <h2>Our Approach</h2>
        <p>
          We&apos;ve built this platform with several key principles in mind:
        </p>
        <ul>
          <li><strong>Simplicity</strong> - No complex databases, just markdown files</li>
          <li><strong>Performance</strong> - Static generation with incremental regeneration</li>
          <li><strong>Longevity</strong> - Content stored in Git, future-proof and portable</li>
          <li><strong>Free</strong> - Entirely within free tier limits of modern platforms</li>
        </ul>

        <h2>Get in Touch</h2>
        <p>
          Have questions or want to contribute? Feel free to{" "}
          <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
