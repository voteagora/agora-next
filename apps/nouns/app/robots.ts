import { MetadataRoute } from "next"

import { appUrl } from "./components"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${appUrl}/sitemap.xml`
  }
}
