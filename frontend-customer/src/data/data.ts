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
        image: { url: "/images/cordless-drill.jpg" },
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
        image: { url: "/images/safety-gloves.jpg" },
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
        image: { url: "/images/steel-hammer.jpg" },
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
      { image: { url: "/images/products/cordless-drill-front.jpg" } },
      { image: { url: "/images/products/cordless-drill-side.jpg" } },
      { image: { url: "/images/products/cordless-drill-kit.jpg" } },
    ],
  },
  customTextFields: [
    {
      title: "https://example.com/manual-cordless-drill", // could link to product manual
    },
  ],
};
