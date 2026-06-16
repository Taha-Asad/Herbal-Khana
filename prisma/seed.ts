import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@herbalkhana.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
    console.log(`  Role: ${existing.role}`);
    console.log(`  Name: ${existing.name}`);
    console.log(`  Email verified: ${existing.emailVerified}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
    },
  });

  console.log(`Admin user seeded: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
