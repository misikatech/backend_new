const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@misika.com' },
    update: {},
    create: {
      email: 'admin@misika.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true
    }
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@misika.com' },
    update: {},
    create: {
      email: 'user@misika.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '9876543210',
      isVerified: true
    }
  });

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
      image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing and accessories',
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Home decor and furniture',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books and educational materials',
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'
    }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
    createdCategories.push(createdCategory);
  }

  // Create products
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 2999,
      salePrice: 2499,
      sku: 'WBH001',
      stock: 50,
      images: [
        'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
        'https://images.pexels.com/photos/3394651/pexels-photo-3394651.jpeg'
      ],
      isFeatured: true,
      categoryId: createdCategories.find(c => c.slug === 'electronics').id
    },
    {
      name: 'Cotton T-Shirt',
      slug: 'cotton-t-shirt',
      description: 'Comfortable 100% cotton t-shirt available in multiple colors',
      price: 599,
      salePrice: 449,
      sku: 'CTS001',
      stock: 100,
      images: [
        'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg'
      ],
      isFeatured: true,
      categoryId: createdCategories.find(c => c.slug === 'fashion').id
    },
    {
      name: 'Decorative Table Lamp',
      slug: 'decorative-table-lamp',
      description: 'Modern decorative table lamp for home and office',
      price: 1299,
      sku: 'DTL001',
      stock: 25,
      images: [
        'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg'
      ],
      isFeatured: false,
      categoryId: createdCategories.find(c => c.slug === 'home-living').id
    },
    {
      name: 'Programming Book Set',
      slug: 'programming-book-set',
      description: 'Complete set of programming books for beginners',
      price: 1999,
      salePrice: 1599,
      sku: 'PBS001',
      stock: 30,
      images: [
        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'
      ],
      isFeatured: true,
      categoryId: createdCategories.find(c => c.slug === 'books').id
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product
    });
  }

  // Create sample address for test user
  await prisma.address.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: 'Home'
      }
    },
    update: {},
    create: {
      userId: user.id,
      name: 'Test User',
      phone: '9876543210',
      street: '123 Test Street, Test Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      type: 'HOME',
      isDefault: true
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('👤 Admin user: admin@misika.com / admin123');
  console.log('👤 Test user: user@misika.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });