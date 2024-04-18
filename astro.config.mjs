import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightImageZoom from 'starlight-image-zoom'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      plugins: [starlightImageZoom()],
      title: "",
      tableOfContents: false,
      logo: {
        src: "/src/assets/images/name.png",
      },
      // favicon: "/public/favicon.ico",
      // social: {
      //   github: "https://github.com/Berkindale",
      // },
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
        {
          label: "References",
          autogenerate: { directory: "references" },
          collapsed: true,
        },
      ],
    }),
  ],
});
