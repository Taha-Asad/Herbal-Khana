interface Product {
  Id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
}
const allProducts: Product[] = [
  {
    Id: 1,
    name: "Herbal Hair Growth Oil",
    description:
      "Nourishing blend of natural oils to promote healthy hair growth and reduce hair fall.",
    price: "Rs. 1,299",
    image:
      "https://images.unsplash.com/photo-1669281393403-e1f3248dce2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwaGFpciUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NjI3OTA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Hair Care",
  },
  {
    Id: 2,
    name: "Natural Glow Face Cream",
    description:
      "Illuminate your skin with this hydrating cream enriched with herbal extracts.",
    price: "Rs. 1,499",
    image:
      "https://images.unsplash.com/photo-1615205597144-5c7c885291d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBza2luY2FyZSUyMGNyZWFtJTIwamFyfGVufDF8fHx8MTc2Mjc5MDgwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Skin Care",
  },
  {
    Id: 3,
    name: "Herbal Face Serum",
    description:
      "Concentrated botanical formula for deep nourishment and radiant skin.",
    price: "Rs. 1,799",
    image:
      "https://images.unsplash.com/photo-1671493234884-b1611bcf3e69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBza2luY2FyZSUyMGJvdHRsZXMlMjBuYXR1cmFsfGVufDF8fHx8MTc2Mjc5MDgwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Skin Care",
  },
  // {
  //   Id: 4,
  //   name: "Scalp Treatment Oil",
  //   description:
  //     "Therapeutic herbal blend to soothe and revitalize your scalp naturally.",
  //   price: "Rs. 1,399",
  //   image:
  //     "https://images.unsplash.com/photo-1669281393403-e1f3248dce2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwaGFpciUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NjI3OTA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  //   category: "Hair Care",
  // },
  // {
  //   id: 5,
  //   name: "Rose & Sandalwood Face Pack",
  //   description:
  //     "Traditional herbal face pack for brightening and deep cleansing.",
  //   price: "Rs. 899",
  //   image:
  //     "https://images.unsplash.com/photo-1615205597144-5c7c885291d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBza2luY2FyZSUyMGNyZWFtJTIwamFyfGVufDF8fHx8MTc2Mjc5MDgwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  //   category: "Skin Care",
  // },
  // {
  //   id: 6,
  //   name: "Anti-Dandruff Hair Oil",
  //   description: "Herbal formula to eliminate dandruff and soothe itchy scalp.",
  //   price: "Rs. 1,199",
  //   image:
  //     "https://images.unsplash.com/photo-1669281393403-e1f3248dce2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwaGFpciUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NjI3OTA4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  //   category: "Hair Care",
  // },
  // {
  //   id: 7,
  //   name: "Turmeric & Neem Face Wash",
  //   description: "Gentle herbal cleanser for clear, glowing skin.",
  //   price: "Rs. 799",
  //   image:
  //     "https://images.unsplash.com/photo-1671493234884-b1611bcf3e69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBza2luY2FyZSUyMGJvdHRsZXMlMjBuYXR1cmFsfGVufDF8fHx8MTc2Mjc5MDgwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  //   category: "Skin Care",
  // },
  // {
  //   id: 8,
  //   name: "Deep Conditioning Hair Mask",
  //   description: "Rich herbal treatment for soft, shiny, and manageable hair.",
  //   price: "Rs. 1,599",
  //   image:
  //     "https://images.unsplash.com/photo-1615205597144-5c7c885291d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjBza2luY2FyZSUyMGNyZWFtJTIwamFyfGVufDF8fHx8MTc2Mjc5MDgwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  //   category: "Hair Care",
  // },
];

export default allProducts;
