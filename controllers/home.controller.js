const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');

// @desc    Get hero banners
// @route   GET /api/home/hero-banners
// @access  Public
const getHeroBanners = asyncHandler(async (req, res) => {
  const banners = [
    {
      id: 1,
      title: "Premium Fashion Collection",
      subtitle: "Discover the latest trends",
      description: "Explore our curated collection of premium fashion items",
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
      buttonText: "Shop Now",
      buttonLink: "/products?category=fashion",
      isActive: true
    },
    {
      id: 2,
      title: "Electronics Sale",
      subtitle: "Up to 50% off",
      description: "Latest gadgets and electronics at unbeatable prices",
      image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg",
      buttonText: "Explore Deals",
      buttonLink: "/products?category=electronics",
      isActive: true
    },
    {
      id: 3,
      title: "Home & Living",
      subtitle: "Transform your space",
      description: "Beautiful home decor and furniture collection",
      image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
      buttonText: "Shop Home",
      buttonLink: "/products?category=home",
      isActive: true
    }
  ];

  ApiResponse.success(res, banners, 'Hero banners fetched successfully');
});

// @desc    Get featured products
// @route   GET /api/home/featured-products
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true
    },
    include: {
      category: {
        select: { name: true, slug: true }
      }
    },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  ApiResponse.success(res, products, 'Featured products fetched successfully');
});

// @desc    Get categories
// @route   GET /api/home/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  ApiResponse.success(res, categories, 'Categories fetched successfully');
});

// @desc    Get offers/deals
// @route   GET /api/home/offers
// @access  Public
const getOffers = asyncHandler(async (req, res) => {
  const offers = [
    {
      id: 1,
      title: "Flash Sale",
      description: "Limited time offer - Up to 70% off",
      discount: 70,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      image: "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg",
      isActive: true
    },
    {
      id: 2,
      title: "Free Shipping",
      description: "Free shipping on orders above ₹999",
      minOrderValue: 999,
      image: "https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg",
      isActive: true
    }
  ];

  ApiResponse.success(res, offers, 'Offers fetched successfully');
});

module.exports = {
  getHeroBanners,
  getFeaturedProducts,
  getCategories,
  getOffers
};