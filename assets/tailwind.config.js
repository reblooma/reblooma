// Shared Tailwind (CDN) config for every Reblooma page.
// Merged from the Stitch exports for the landing and practitioner pages.
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#1a1c1e",
        "on-primary-container": "#838486",
        "primary-fixed": "#e2e2e5",
        "primary-fixed-dim": "#c6c6c9",
        "on-primary-fixed": "#1a1c1e",
        "on-primary-fixed-variant": "#454749",
        "inverse-primary": "#c6c6c9",
        "secondary": "#605e5c",
        "on-secondary": "#ffffff",
        "secondary-container": "#e6e2df",
        "on-secondary-container": "#666462",
        "secondary-fixed": "#e6e2df",
        "secondary-fixed-dim": "#cac6c3",
        "on-secondary-fixed": "#1d1b1a",
        "on-secondary-fixed-variant": "#484644",
        "tertiary": "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#00201e",
        "on-tertiary-container": "#00938e",
        "tertiary-fixed": "#84f5ee",
        "tertiary-fixed-dim": "#66d8d2",
        "on-tertiary-fixed": "#00201e",
        "on-tertiary-fixed-variant": "#00504d",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "background": "#fcf9f6",
        "on-background": "#1c1c1a",
        "surface": "#fcf9f6",
        "surface-bright": "#fcf9f6",
        "surface-dim": "#dcd9d7",
        "surface-tint": "#5d5e61",
        "surface-variant": "#e5e2df",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f0",
        "surface-container": "#f0edea",
        "surface-container-high": "#eae8e5",
        "surface-container-highest": "#e5e2df",
        "surface-tier-1": "#f3f0ed",
        "surface-tier-2": "#efebe7",
        "surface-stone": "#e4deda",
        "on-surface": "#1c1c1a",
        "on-surface-variant": "#44474a",
        "inverse-surface": "#31302f",
        "inverse-on-surface": "#f3f0ed",
        "outline": "#75777a",
        "outline-variant": "#c5c6ca",
        "outline-muted": "rgba(22, 24, 26, 0.08)",
        "ink": "#16181a",
        "navy-deep": "#243546",
        "brand-purple": "#6200ee"
      },
      // The Stitch exports use opacity-42 / opacity-62 and text-x/62; these aren't in
      // Tailwind's default scale, so without this they silently render at full strength.
      opacity: { "42": "0.42", "62": "0.62" },
      borderRadius: { DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem" },
      spacing: {
        "section-gap": "96px",
        "section-gap-md": "64px",
        "section-gap-sm": "52px",
        "container-padding": "24px",
        "gutter": "16px",
        "base": "8px"
      },
      fontFamily: {
        "display-lg": ["Lora"],
        "display-lg-mobile": ["Lora"],
        "headline-md": ["Lora"],
        "headline-sm": ["Lora"],
        "body-lg": ["\"Source Sans 3\""],
        "body-md": ["\"Source Sans 3\""],
        "label-caps": ["\"Source Sans 3\""],
        "ui-button": ["\"Source Sans 3\""]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
        "display-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "500" }],
        "headline-md": ["32px", { lineHeight: "1.3", fontWeight: "500" }],
        "headline-sm": ["24px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "300" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
        "ui-button": ["14px", { lineHeight: "1", fontWeight: "600" }]
      }
    }
  }
};
