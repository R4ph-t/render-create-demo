import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "{{PROJECT_NAME}}",
  tagline: "Documentation",
  favicon: "img/favicon.ico",
  url: "https://{{PROJECT_NAME}}.onrender.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "{{PROJECT_NAME}}",
    },
  },
};

export default config;
