export const sampleProducts = [
  {
    _id: "1",
    slug: "cordless-drill",
    name: "Cordless Drill",
    priceData: {
      price: 79.99,
    },
    media: {
      mainMedia: {
        image: { url: "/tools/tool1.jpg" },
      },
      items: [
        { image: { url: "/images/cordless-drill-front.jpg" } },
        { image: { url: "/images/cordless-drill-side.jpg" } },
      ],
    },
    additionalInfoSections: [
      {
        title: "shortDesc",
        description:
          "Powerful cordless drill with 18V battery, ideal for home and professional use.",
      },
    ],
  },
  {
    _id: "2",
    slug: "safety-gloves",
    name: "Safety Gloves",
    priceData: {
      price: 14.99,
    },
    media: {
      mainMedia: {
        image: { url: "/tools/tool2.jpg" },
      },
      items: [
        { image: { url: "/images/safety-gloves-front.jpg" } },
        { image: { url: "/images/safety-gloves-back.jpg" } },
      ],
    },
    additionalInfoSections: [
      {
        title: "shortDesc",
        description:
          "Durable, cut-resistant gloves for handling tools and heavy materials.",
      },
    ],
  },
  {
    _id: "3",
    slug: "steel-hammer",
    name: "Steel Hammer",
    priceData: {
      price: 24.99,
    },
    media: {
      mainMedia: {
        image: { url: "/tools/tool3.jpg" },
      },
      items: [
        { image: { url: "/images/steel-hammer-front.jpg" } },
        { image: { url: "/images/steel-hammer-back.jpg" } },
      ],
    },
    additionalInfoSections: [
      {
        title: "shortDesc",
        description:
          "Heavy-duty steel hammer with anti-slip grip, perfect for carpentry and construction.",
      },
    ],
  },
  {
    _id: "4",
    slug: "measuring-tape",
    name: "Measuring Tape",
    priceData: {
      price: 9.99,
    },
    media: {
      mainMedia: {
        image: { url: "/tools/tool4.jpg" },
      },
      items: [
        { image: { url: "/images/measuring-tape-front.jpg" } },
        { image: { url: "/images/measuring-tape-side.jpg" } },
      ],
    },
    additionalInfoSections: [
      {
        title: "shortDesc",
        description:
          "Durable 5m measuring tape with auto-lock and belt clip, perfect for accurate measurements.",
      },
    ],
  },
];

export const sampleProduct = {
  _id: "p1",
  slug: "cordless-drill",
  name: "Cordless Drill",
  description:
    "A high-performance cordless drill with a rechargeable 18V lithium-ion battery. Features variable speed settings and a compact design for easy handling.",
  priceData: {
    price: 89.99,
    discountedPrice: 74.99,
  },
  media: {
    items: [
      { image: { url: "/tools/tool1.jpg" } },
      { image: { url: "/tools/tool2.jpg" } },
      { image: { url: "/tools/tool3.jpg" } },
    ],
  },
  customTextFields: [
    {
      title: "https://example.com/manual-cordless-drill", // could link to product manual
    },
  ],
};
