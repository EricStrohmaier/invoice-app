/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Disable canvas and encoding modules
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Handle PDF.js worker
    config.resolve.alias["pdfjs-dist/build/pdf.worker.entry"] = false;

    return config;
  },
  transpilePackages: ["@react-pdf/renderer"],
  // These tools moved to the main site. Forward the old routes to their new
  // homes on ericstrohmaier.com (runs before middleware).
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://ericstrohmaier.com/invoice",
        permanent: true,
      },
      {
        source: "/tracker",
        destination: "https://ericstrohmaier.com/timetracking",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "https://ericstrohmaier.com/dashboard",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "https://ericstrohmaier.com/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
