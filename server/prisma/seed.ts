import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The demo seed is destructive and must not run in production.');
  }

  console.log('🌱 Starting database seeding...');

  // 1. Clean existing data in correct FK dependency order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('AdminPass123!', salt);
  const customerPassword = await bcrypt.hash('CustomerPass123!', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@store.com',
      passwordHash: adminPassword,
      firstName: 'Store',
      lastName: 'Administrator',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@store.com',
      passwordHash: customerPassword,
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Created Admin (admin@store.com) & Customer (customer@store.com)');

  // 3. Create Categories
  const audioCategory = await prisma.category.create({
    data: {
      name: 'Audio & Sound',
      slug: 'audio-sound',
      description: 'Premium noise-cancelling headphones, high-fidelity earbuds, and spatial audio soundbars.',
    },
  });

  const wearablesCategory = await prisma.category.create({
    data: {
      name: 'Smart Wearables',
      slug: 'smart-wearables',
      description: 'Fitness trackers, smartwatches with ECG, and health-monitoring bio-wearables.',
    },
  });

  const computersCategory = await prisma.category.create({
    data: {
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'High-performance ultra-books, mechanical keyboards, and gaming gear.',
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Tech Accessories',
      slug: 'tech-accessories',
      description: 'Fast wireless chargers, ergonomic laptop stands, and premium travel cases.',
    },
  });

  console.log('✅ Created 4 Core Categories');

  // 4. Create Products with Images
  const products = [
    {
      name: 'AeroPulse Pro Noise-Cancelling Headphones',
      slug: 'aeropulse-pro-headphones',
      description: 'Flagship wireless headphones featuring adaptive active noise cancellation, 40mm beryllium drivers, 45-hour battery life, and ultra-plush memory foam earcups.',
      price: 299.99,
      stock: 35,
      categoryId: audioCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', isPrimary: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      name: 'EchoPods Ultra Wireless Earbuds',
      slug: 'echopods-ultra-earbuds',
      description: 'True wireless spatial audio earbuds with transparent listening mode, IPX7 water resistance, wireless charging case, and crystal-clear beamforming microphone array.',
      price: 149.99,
      stock: 50,
      categoryId: audioCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', isPrimary: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      name: 'Vanguard Chronos Smartwatch Gen 4',
      slug: 'vanguard-chronos-smartwatch',
      description: 'Titanium chassis smartwatch with sapphire crystal display, continuous heart rate and SpO2 tracking, dual-band GPS, and 14-day battery endurance.',
      price: 379.50,
      stock: 22,
      categoryId: wearablesCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', isPrimary: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      name: 'AeroFit Pulse Activity Band',
      slug: 'aerofit-pulse-activity-band',
      description: 'Lightweight biometric fitness tracker with OLED touch display, automated sleep stage tracking, stress monitoring, and water resistance up to 50 meters.',
      price: 89.95,
      stock: 65,
      categoryId: wearablesCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'ApexStudio 16 Pro Laptop M3',
      slug: 'apexstudio-16-pro-laptop',
      description: 'Creator powerhouse featuring a 16-inch 3.2K 120Hz Mini-LED display, 32GB unified RAM, 1TB NVMe Gen4 SSD, and precision CNC aluminum unibody.',
      price: 1899.00,
      stock: 12,
      categoryId: computersCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', isPrimary: true, displayOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', isPrimary: false, displayOrder: 1 },
      ],
    },
    {
      name: 'HyperTactile 75 Mechanical Keyboard',
      slug: 'hypertactile-75-mechanical-keyboard',
      description: 'Custom gasket-mounted wireless mechanical keyboard with hot-swappable tactile switches, double-shot PBT keycaps, per-key RGB backlighting, and volume knob.',
      price: 139.00,
      stock: 28,
      categoryId: computersCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'MagCharge Trio 3-in-1 Fast Charging Station',
      slug: 'magcharge-trio-wireless-station',
      description: 'Foldable aircraft-grade aluminum stand capable of simultaneously fast-charging your smartphone (15W), smartwatch (5W), and wireless earbuds (5W).',
      price: 69.99,
      stock: 40,
      categoryId: accessoriesCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&q=80', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'ErgoLift Aluminum Laptop Stand',
      slug: 'ergolift-aluminum-laptop-stand',
      description: 'Full-motion 360-degree rotating ergonomic laptop riser designed with cooling ventilation cutouts and anti-slip silicone pads. Supports up to 17-inch devices.',
      price: 49.50,
      stock: 55,
      categoryId: accessoriesCategory.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', isPrimary: true, displayOrder: 0 },
      ],
    },
    {
      name: 'NexusBeam 4K Smart Monitor',
      slug: 'nexusbeam-4k-smart-monitor',
      description: 'A color-accurate 32-inch 4K monitor with USB-C power delivery, HDR support, and a height-adjustable stand.',
      price: 449.99,
      stock: 18,
      categoryId: computersCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'PulseCore Wireless Gaming Mouse',
      slug: 'pulsecore-wireless-gaming-mouse',
      description: 'An ultra-light wireless mouse with a precision optical sensor, silent clicks, and configurable RGB lighting.',
      price: 79.99,
      stock: 42,
      categoryId: computersCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'VaultDrive Portable SSD 2TB',
      slug: 'vaultdrive-portable-ssd-2tb',
      description: 'Pocket-sized USB-C solid-state storage with fast transfers and rugged drop-resistant construction.',
      price: 159.99,
      stock: 30,
      categoryId: computersCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'AeroSound Studio Microphone',
      slug: 'aerosound-studio-microphone',
      description: 'A plug-and-play USB condenser microphone for streaming, meetings, podcasts, and studio-quality voice recording.',
      price: 129.99,
      stock: 24,
      categoryId: audioCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'EchoDock Bluetooth Speaker',
      slug: 'echodock-bluetooth-speaker',
      description: 'Compact room-filling wireless audio with rich bass, multi-room pairing, and up to 18 hours of battery life.',
      price: 99.99,
      stock: 37,
      categoryId: audioCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'OrbitView VR Headset',
      slug: 'orbitview-vr-headset',
      description: 'Immersive standalone VR headset with high-resolution lenses, spatial audio, and comfortable adjustable straps.',
      price: 499.00,
      stock: 10,
      categoryId: audioCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'ChargeGrid 100W GaN Charger',
      slug: 'chargegrid-100w-gan-charger',
      description: 'Four-port compact GaN charger that safely powers laptops, tablets, phones, and accessories at once.',
      price: 74.99,
      stock: 60,
      categoryId: accessoriesCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'TravelCore Tech Organizer',
      slug: 'travelcore-tech-organizer',
      description: 'Water-resistant organizer case with structured pockets for chargers, cables, drives, and everyday electronics.',
      price: 34.99,
      stock: 75,
      categoryId: accessoriesCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'LumaLink USB-C Hub',
      slug: 'lumalink-usb-c-hub',
      description: 'Slim seven-in-one USB-C hub with HDMI, card readers, USB 3.0, and pass-through charging for modern laptops.',
      price: 59.99,
      stock: 48,
      categoryId: accessoriesCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'NexusFit Smart Scale',
      slug: 'nexusfit-smart-scale',
      description: 'Connected body composition scale with multi-user profiles, precise sensors, and a companion mobile dashboard.',
      price: 49.99,
      stock: 33,
      categoryId: wearablesCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
    {
      name: 'Vantage Wireless Fitness Earbuds',
      slug: 'vantage-wireless-fitness-earbuds',
      description: 'Sweat-resistant sport earbuds with secure ear hooks, transparency mode, and a compact charging case.',
      price: 109.99,
      stock: 44,
      categoryId: wearablesCategory.id,
      images: [{ url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80', isPrimary: true, displayOrder: 0 }],
    },
  ];

  for (const prod of products) {
    const { images, ...productData } = prod;
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images,
        },
      },
    });
    console.log(`📦 Seeded: ${createdProduct.name} ($${createdProduct.price})`);
  }

  // 5. Create a sample initial order for the customer
  const firstProduct = await prisma.product.findFirstOrThrow({ where: { slug: 'aeropulse-pro-headphones' } });
  const sampleOrder = await prisma.order.create({
    data: {
      userId: customer.id,
      status: 'DELIVERED',
      subtotal: 299.99,
      tax: 24.00,
      shippingCost: 0,
      totalAmount: 323.99,
      shippingAddress: JSON.stringify({
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'United States',
      }),
      items: {
        create: [
          {
            productId: firstProduct.id,
            productNameSnapshot: firstProduct.name,
            unitPriceSnapshot: firstProduct.price,
            quantity: 1,
            totalPrice: 299.99,
          },
        ],
      },
    },
  });

  console.log(`🧾 Seeded sample order ${sampleOrder.id} for Alex Morgan`);
  console.log('✨ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
