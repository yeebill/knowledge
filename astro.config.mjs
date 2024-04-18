import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightImageZoom from 'starlight-image-zoom'

// https://astro.build/config
export default defineConfig({
  site: "https://yeebill.github.io",
  base: "knowledge",
  integrations: [
    starlight({
      plugins: [starlightImageZoom()],
      title: "",
      tableOfContents: false,
      logo: {
        src: "/src/assets/images/name.png",
      },
      sidebar: [
        {
          label: "Concepts",
          autogenerate: { directory: "concepts" },
          collapsed: true,
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
          collapsed: true,
        },
      ],
    }),
  ],
});
