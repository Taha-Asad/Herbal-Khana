// // prisma/seed.ts

// import "dotenv/config";
// import { hash } from "bcryptjs";
// import prisma from "@/lib/prisma";
// import { PROMO_TYPE } from "@/generated/prisma/enums";

// async function main() {
//   console.log("🌱 Starting seed...");

//   // =============================================================================
//   // CLEAN UP EXISTING DATA
//   // =============================================================================
//   console.log("🧹 Cleaning up existing data...");

//   await prisma.cartItem.deleteMany();
//   await prisma.cart.deleteMany();
//   await prisma.userPromoCode.deleteMany();
//   await prisma.promoCode.deleteMany();
//   await prisma.shippingMethod.deleteMany();
//   await prisma.orderItem.deleteMany();
//   await prisma.orderTimeline.deleteMany();
//   await prisma.order.deleteMany();
//   await prisma.review.deleteMany();
//   await prisma.comment.deleteMany();
//   await prisma.bookmarkedProduct.deleteMany();
//   await prisma.productVariant.deleteMany();
//   await prisma.productImage.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.address.deleteMany();
//   await prisma.session.deleteMany();
//   await prisma.oAuthAccount.deleteMany();
//   // Don't delete all users, only non-existing ones
//   // await prisma.user.deleteMany();

//   console.log("   ✅ Cleaned up existing data");

//   // =============================================================================
//   // GET OR CREATE YOUR USER
//   // =============================================================================
//   console.log("👤 Setting up users...");

//   const hashedPassword = await hash("password123", 12);

//   // Your existing user - update or get
//   let testUser = await prisma.user.findUnique({
//     where: { email: "tahaasad709@gmail.com" },
//   });

//   if (!testUser) {
//     testUser = await prisma.user.create({
//       data: {
//         email: "tahaasad709@gmail.com",
//         name: "Taha Asad",
//         password: hashedPassword,
//         role: "USER",
//         emailVerified: true,
//         isActive: true,
//       },
//     });
//     console.log("   ✅ Created user: tahaasad709@gmail.com");
//   } else {
//     console.log("   ✅ Using existing user: tahaasad709@gmail.com");
//   }

//   // Create admin if doesn't exist
//   let adminUser = await prisma.user.findUnique({
//     where: { email: "admin@example.com" },
//   });

//   if (!adminUser) {
//     adminUser = await prisma.user.create({
//       data: {
//         email: "admin@example.com",
//         name: "Admin User",
//         password: hashedPassword,
//         role: "ADMIN",
//         emailVerified: true,
//         isActive: true,
//       },
//     });
//   }

//   console.log("   ✅ Users ready");

//   // =============================================================================
//   // CREATE CATEGORIES
//   // =============================================================================
//   console.log("📂 Creating categories...");

//   const categories = await Promise.all([
//     prisma.category.create({
//       data: {
//         name: "Men's Fragrances",
//         slug: "mens-fragrances",
//         description: "Premium fragrances for men",
//         image:
//           "https://images.unsplash.com/photo-1594035900144-17f0f4c2d7d3?w=400",
//         isActive: true,
//         sortOrder: 1,
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: "Women's Fragrances",
//         slug: "womens-fragrances",
//         description: "Elegant fragrances for women",
//         image:
//           "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
//         isActive: true,
//         sortOrder: 2,
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: "Unisex Fragrances",
//         slug: "unisex-fragrances",
//         description: "Versatile fragrances for everyone",
//         image:
//           "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400",
//         isActive: true,
//         sortOrder: 3,
//       },
//     }),
//     prisma.category.create({
//       data: {
//         name: "Oud Collection",
//         slug: "oud-collection",
//         description: "Luxury oud-based fragrances",
//         image:
//           "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400",
//         isActive: true,
//         sortOrder: 4,
//       },
//     }),
//   ]);

//   const [menCategory, womenCategory, unisexCategory, oudCategory] = categories;
//   console.log(`   ✅ Created ${categories.length} categories`);

//   // =============================================================================
//   // CREATE PRODUCTS WITH VARIANTS
//   // =============================================================================
//   console.log("🧴 Creating products with variants...");

//   // Product 1: Royal Oud Intense
//   const product1 = await prisma.product.create({
//     data: {
//       name: "Royal Oud Intense",
//       slug: "royal-oud-intense",
//       description:
//         "A powerful and sophisticated fragrance featuring rare Arabian oud, combined with warm amber and sandalwood.",
//       shortDescription: "Powerful Arabian oud with amber and sandalwood",
//       sku: "ROI-001",
//       costPrice: 12000,
//       weight: 0.3,
//       isActive: true,
//       isFeatured: true,
//       isNew: true,
//       categoryId: menCategory.id,
//       images: {
//         create: [
//           {
//             url: "https://images.unsplash.com/photo-1594035900144-17f0f4c2d7d3?w=800",
//             isPrimary: true,
//             sortOrder: 0,
//           },
//           {
//             url: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800",
//             isPrimary: false,
//             sortOrder: 1,
//           },
//         ],
//       },
//       productVariants: {
//         create: [
//           {
//             name: "30ml EDP",
//             size: "30ml",
//             scent: "Oud Intense",
//             concentration: "EDP",
//             sku: "ROI-001-30ML",
//             price: 3500,
//             stock: 25,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "50ml EDP",
//             size: "50ml",
//             scent: "Oud Intense",
//             concentration: "EDP",
//             sku: "ROI-001-50ML",
//             price: 5500,
//             stock: 20,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "100ml EDP",
//             size: "100ml",
//             scent: "Oud Intense",
//             concentration: "EDP",
//             sku: "ROI-001-100ML",
//             price: 8500,
//             stock: 15,
//             lowStockThreshold: 5,
//           },
//         ],
//       },
//     },
//   });

//   // Product 2: Noir Gentleman
//   const product2 = await prisma.product.create({
//     data: {
//       name: "Noir Gentleman",
//       slug: "noir-gentleman",
//       description:
//         "A classic masculine fragrance with notes of bergamot, leather, and vetiver.",
//       shortDescription: "Classic masculine scent with leather and vetiver",
//       sku: "NG-002",
//       costPrice: 8000,
//       weight: 0.25,
//       isActive: true,
//       isFeatured: true,
//       isNew: false,
//       categoryId: menCategory.id,
//       images: {
//         create: [
//           {
//             url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
//             isPrimary: true,
//             sortOrder: 0,
//           },
//         ],
//       },
//       productVariants: {
//         create: [
//           {
//             name: "30ml EDT",
//             size: "30ml",
//             scent: "Noir",
//             concentration: "EDT",
//             sku: "NG-002-30ML",
//             price: 2800,
//             stock: 30,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "50ml EDT",
//             size: "50ml",
//             scent: "Noir",
//             concentration: "EDT",
//             sku: "NG-002-50ML",
//             price: 4200,
//             stock: 25,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "100ml EDT",
//             size: "100ml",
//             scent: "Noir",
//             concentration: "EDT",
//             sku: "NG-002-100ML",
//             price: 6500,
//             stock: 18,
//             lowStockThreshold: 5,
//           },
//         ],
//       },
//     },
//   });

//   // Product 3: Rose Elegance
//   const product3 = await prisma.product.create({
//     data: {
//       name: "Rose Elegance",
//       slug: "rose-elegance",
//       description:
//         "A delicate and feminine fragrance featuring Bulgarian rose, peony, and white musk.",
//       shortDescription: "Delicate floral with Bulgarian rose and peony",
//       sku: "RE-003",
//       costPrice: 9000,
//       weight: 0.28,
//       isActive: true,
//       isFeatured: true,
//       isNew: false,
//       categoryId: womenCategory.id,
//       images: {
//         create: [
//           {
//             url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
//             isPrimary: true,
//             sortOrder: 0,
//           },
//         ],
//       },
//       productVariants: {
//         create: [
//           {
//             name: "30ml EDP",
//             size: "30ml",
//             scent: "Rose",
//             concentration: "EDP",
//             sku: "RE-003-30ML",
//             price: 3200,
//             stock: 22,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "50ml EDP",
//             size: "50ml",
//             scent: "Rose",
//             concentration: "EDP",
//             sku: "RE-003-50ML",
//             price: 4800,
//             stock: 18,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "100ml EDP",
//             size: "100ml",
//             scent: "Rose",
//             concentration: "EDP",
//             sku: "RE-003-100ML",
//             price: 7500,
//             stock: 12,
//             lowStockThreshold: 5,
//           },
//         ],
//       },
//     },
//   });

//   // Product 4: Jasmine Dreams
//   const product4 = await prisma.product.create({
//     data: {
//       name: "Jasmine Dreams",
//       slug: "jasmine-dreams",
//       description:
//         "An enchanting fragrance with jasmine sambac, ylang-ylang, and vanilla.",
//       shortDescription: "Enchanting jasmine with vanilla undertones",
//       sku: "JD-004",
//       costPrice: 7500,
//       weight: 0.25,
//       isActive: true,
//       isFeatured: false,
//       isNew: true,
//       categoryId: womenCategory.id,
//       images: {
//         create: [
//           {
//             url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800",
//             isPrimary: true,
//             sortOrder: 0,
//           },
//         ],
//       },
//       productVariants: {
//         create: [
//           {
//             name: "30ml EDP",
//             size: "30ml",
//             scent: "Jasmine",
//             concentration: "EDP",
//             sku: "JD-004-30ML",
//             price: 2900,
//             stock: 28,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "50ml EDP",
//             size: "50ml",
//             scent: "Jasmine",
//             concentration: "EDP",
//             sku: "JD-004-50ML",
//             price: 4300,
//             stock: 22,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "100ml EDP",
//             size: "100ml",
//             scent: "Jasmine",
//             concentration: "EDP",
//             sku: "JD-004-100ML",
//             price: 6800,
//             stock: 15,
//             lowStockThreshold: 5,
//           },
//         ],
//       },
//     },
//   });

//   // Product 5: Amber Mystique
//   const product5 = await prisma.product.create({
//     data: {
//       name: "Amber Mystique",
//       slug: "amber-mystique",
//       description:
//         "A captivating unisex fragrance with amber, benzoin, and labdanum.",
//       shortDescription: "Captivating amber blend for all",
//       sku: "AM-005",
//       costPrice: 8500,
//       weight: 0.27,
//       isActive: true,
//       isFeatured: true,
//       isNew: true,
//       categoryId: unisexCategory.id,
//       images: {
//         create: [
//           {
//             url: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800",
//             isPrimary: true,
//             sortOrder: 0,
//           },
//         ],
//       },
//       productVariants: {
//         create: [
//           {
//             name: "30ml Parfum",
//             size: "30ml",
//             scent: "Amber",
//             concentration: "Parfum",
//             sku: "AM-005-30ML",
//             price: 3800,
//             stock: 20,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "50ml Parfum",
//             size: "50ml",
//             scent: "Amber",
//             concentration: "Parfum",
//             sku: "AM-005-50ML",
//             price: 5600,
//             stock: 16,
//             lowStockThreshold: 5,
//           },
//           {
//             name: "100ml Parfum",
//             size: "100ml",
//             scent: "Amber",
//             concentration: "Parfum",
//             sku: "AM-005-100ML",
//             price: 8800,
//             stock: 10,
//             lowStockThreshold: 5,
//           },
//         ],
//       },
//     },
//   });

//   // Product 6: Private Oud
//   const product6 = await prisma.product.create({
//     data: {
//       name: "Private Oud",
//       slug: "private-oud",
//       description:
//         "An exclusive blend of rare Cambodian oud, saffron, and rose absolute.",
//       shortDescription: "Exclusive Cambodian oud masterpiece",
//       sku: "PO-006",
//       costPrice: 18000,
//       weight: 0.35,
//       isActive: true,
//       isFeatured: true,
//       isNew: true,
//       categoryId: oudCategory.id,
//       images: {
//         create: [
//           {
//             url: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800",
//             isPrimary: true,
//             sortOrder: 0,
//           },
//         ],
//       },
//       productVariants: {
//         create: [
//           {
//             name: "15ml Parfum",
//             size: "15ml",
//             scent: "Cambodian Oud",
//             concentration: "Parfum",
//             sku: "PO-006-15ML",
//             price: 6500,
//             stock: 10,
//             lowStockThreshold: 3,
//           },
//           {
//             name: "30ml Parfum",
//             size: "30ml",
//             scent: "Cambodian Oud",
//             concentration: "Parfum",
//             sku: "PO-006-30ML",
//             price: 11000,
//             stock: 8,
//             lowStockThreshold: 3,
//           },
//           {
//             name: "50ml Parfum",
//             size: "50ml",
//             scent: "Cambodian Oud",
//             concentration: "Parfum",
//             sku: "PO-006-50ML",
//             price: 16500,
//             stock: 5,
//             lowStockThreshold: 2,
//           },
//         ],
//       },
//     },
//   });

//   console.log("   ✅ Created 6 products with variants");

//   // =============================================================================
//   // CREATE SHIPPING METHODS
//   // =============================================================================
//   console.log("🚚 Creating shipping methods...");

//   await prisma.shippingMethod.createMany({
//     data: [
//       {
//         name: "Standard Shipping",
//         description: "Regular delivery within 5-7 business days",
//         price: 200,
//         freeAbove: 5000,
//         estimatedDays: "5-7 business days",
//         isActive: true,
//         sortOrder: 1,
//       },
//       {
//         name: "Express Shipping",
//         description: "Fast delivery within 2-3 business days",
//         price: 400,
//         freeAbove: null,
//         estimatedDays: "2-3 business days",
//         isActive: true,
//         sortOrder: 2,
//       },
//       {
//         name: "Overnight Shipping",
//         description: "Next day delivery for urgent orders",
//         price: 700,
//         freeAbove: null,
//         estimatedDays: "1 business day",
//         isActive: true,
//         sortOrder: 3,
//       },
//     ],
//   });

//   console.log("   ✅ Created 3 shipping methods");

//   // =============================================================================
//   // CREATE PROMO CODES
//   // =============================================================================
//   console.log("🏷️ Creating promo codes...");

//   await prisma.promoCode.createMany({
//     data: [
//       {
//         code: "WELCOME10",
//         description: "10% off for new customers",
//         type: PROMO_TYPE.PERCENTAGE,
//         value: 10,
//         minOrderAmount: 1000,
//         maxDiscount: 500,
//         maxUses: 1000,
//         maxUsesPerUser: 1,
//         usedCount: 0,
//         isActive: true,
//         isFirstOrderOnly: true,
//         startsAt: new Date(),
//         expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
//       },
//       {
//         code: "SAVE500",
//         description: "PKR 500 off on orders above PKR 3000",
//         type: PROMO_TYPE.FIXED,
//         value: 500,
//         minOrderAmount: 3000,
//         maxDiscount: null,
//         maxUses: 500,
//         maxUsesPerUser: 2,
//         usedCount: 0,
//         isActive: true,
//         isFirstOrderOnly: false,
//         startsAt: new Date(),
//         expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
//       },
//       {
//         code: "FREESHIP",
//         description: "Free shipping on any order",
//         type: PROMO_TYPE.FREE_SHIPPING,
//         value: 0,
//         minOrderAmount: 2000,
//         maxDiscount: null,
//         maxUses: null,
//         maxUsesPerUser: 3,
//         usedCount: 0,
//         isActive: true,
//         isFirstOrderOnly: false,
//         startsAt: new Date(),
//         expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
//       },
//       {
//         code: "SUMMER25",
//         description: "25% off summer sale",
//         type: PROMO_TYPE.PERCENTAGE,
//         value: 25,
//         minOrderAmount: 2500,
//         maxDiscount: 1500,
//         maxUses: 300,
//         maxUsesPerUser: 1,
//         usedCount: 0,
//         isActive: true,
//         isFirstOrderOnly: false,
//         startsAt: new Date(),
//         expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
//       },
//     ],
//   });

//   console.log("   ✅ Created 4 promo codes");

//   // =============================================================================
//   // CREATE CART WITH ITEMS FOR YOUR USER
//   // =============================================================================
//   console.log("🛒 Creating cart with items for your user...");

//   // Get variants for cart
//   const variants = await prisma.productVariant.findMany({
//     take: 4,
//     include: { product: true },
//   });

//   if (variants.length >= 3) {
//     const cart = await prisma.cart.create({
//       data: {
//         userId: testUser.id,
//         sessionId: `session-${testUser.id}`,
//         status: "ACTIVE",
//         selectedShippingId: "standard",
//         items: {
//           create: [
//             {
//               variantId: variants[0].id,
//               quantity: 2,
//               isSavedForLater: false,
//             },
//             {
//               variantId: variants[1].id,
//               quantity: 1,
//               isSavedForLater: false,
//             },
//             {
//               variantId: variants[2].id,
//               quantity: 1,
//               isSavedForLater: true,
//             },
//           ],
//         },
//       },
//       include: {
//         items: {
//           include: {
//             variant: {
//               include: { product: true },
//             },
//           },
//         },
//       },
//     });

//     console.log("   ✅ Created cart with items:");
//     cart.items.forEach((item) => {
//       console.log(
//         `      • ${item.variant.product.name} - ${item.variant.name} (Qty: ${
//           item.quantity
//         })${item.isSavedForLater ? " [Saved for later]" : ""}`
//       );
//     });
//   }

//   // =============================================================================
//   // CREATE ADDRESS FOR YOUR USER
//   // =============================================================================
//   console.log("📍 Creating address...");

//   await prisma.address.create({
//     data: {
//       userId: testUser.id,
//       label: "Home",
//       name: testUser.name || "Taha Asad",
//       phone: "+923001234567",
//       line1: "House 123, Street 5",
//       line2: "Sector F-10",
//       city: "Islamabad",
//       state: "Federal",
//       postal: "44000",
//       country: "Pakistan",
//       isDefault: true,
//     },
//   });

//   console.log("   ✅ Created address");

//   // =============================================================================
//   // SUMMARY
//   // =============================================================================
//   console.log("\n" + "=".repeat(60));
//   console.log("✨ SEED COMPLETED SUCCESSFULLY!");
//   console.log("=".repeat(60));
//   console.log("\n📊 Summary:");
//   console.log("   • Categories: 4");
//   console.log("   • Products: 6");
//   console.log("   • Product Variants: 18");
//   console.log("   • Promo Codes: 4");
//   console.log("   • Shipping Methods: 3");
//   console.log("   • Cart with items: 1");

//   console.log("\n🛒 Your Cart (tahaasad709@gmail.com):");
//   console.log("   2 items in cart, 1 saved for later");

//   console.log("\n🏷️ Available Promo Codes:");
//   console.log("   WELCOME10 - 10% off (first order, min PKR 1000)");
//   console.log("   SAVE500   - PKR 500 off (min PKR 3000)");
//   console.log("   FREESHIP  - Free shipping (min PKR 2000)");
//   console.log("   SUMMER25  - 25% off (min PKR 2500)");

//   console.log("\n🔗 Next Steps:");
//   console.log("   1. Start the dev server: npm run dev");
//   console.log("   2. Visit: http://localhost:3000/cart");
//   console.log("   3. Login with: tahaasad709@gmail.com");
//   console.log("");
// }

// main()
//   .catch((e) => {
//     console.error("❌ Seed failed:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
