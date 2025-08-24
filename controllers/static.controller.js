const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');

// @desc    Get about page content
// @route   GET /api/static/about
// @access  Public
const getAbout = asyncHandler(async (req, res) => {
  const aboutContent = {
    title: "About Misika",
    content: `
      <div>
        <h2>Welcome to Misika</h2>
        <p>Misika is your premier destination for quality products and exceptional shopping experience. Founded with a vision to make online shopping accessible, reliable, and enjoyable for everyone.</p>
        
        <h3>Our Mission</h3>
        <p>To provide customers with high-quality products at competitive prices while ensuring excellent customer service and fast delivery.</p>
        
        <h3>Our Values</h3>
        <ul>
          <li>Quality: We source only the best products from trusted suppliers</li>
          <li>Customer First: Your satisfaction is our top priority</li>
          <li>Innovation: We continuously improve our platform and services</li>
          <li>Trust: Building long-term relationships through transparency</li>
        </ul>
        
        <h3>Why Choose Misika?</h3>
        <ul>
          <li>Wide range of products across multiple categories</li>
          <li>Secure payment options</li>
          <li>Fast and reliable delivery</li>
          <li>24/7 customer support</li>
          <li>Easy returns and refunds</li>
        </ul>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  };

  ApiResponse.success(res, aboutContent, 'About content fetched successfully');
});

// @desc    Get services page content
// @route   GET /api/static/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const servicesContent = {
    title: "Our Services",
    services: [
      {
        id: 1,
        title: "Fast Delivery",
        description: "Get your orders delivered within 1-3 business days",
        icon: "🚚"
      },
      {
        id: 2,
        title: "Secure Payments",
        description: "Multiple secure payment options including COD, UPI, and Cards",
        icon: "💳"
      },
      {
        id: 3,
        title: "24/7 Support",
        description: "Round-the-clock customer support for all your queries",
        icon: "🎧"
      },
      {
        id: 4,
        title: "Easy Returns",
        description: "Hassle-free returns within 7-30 days of purchase",
        icon: "↩️"
      },
      {
        id: 5,
        title: "Quality Assurance",
        description: "All products go through strict quality checks",
        icon: "✅"
      },
      {
        id: 6,
        title: "Bulk Orders",
        description: "Special pricing and services for bulk purchases",
        icon: "📦"
      }
    ],
    lastUpdated: new Date().toISOString()
  };

  ApiResponse.success(res, servicesContent, 'Services content fetched successfully');
});

// @desc    Get privacy policy
// @route   GET /api/static/privacy
// @access  Public
const getPrivacyPolicy = asyncHandler(async (req, res) => {
  const privacyContent = {
    title: "Privacy Policy",
    content: `
      <div>
        <h2>Privacy Policy</h2>
        <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.</p>
        
        <h3>How We Use Your Information</h3>
        <ul>
          <li>To process and fulfill your orders</li>
          <li>To communicate with you about your account or orders</li>
          <li>To improve our services and user experience</li>
          <li>To send you promotional communications (with your consent)</li>
        </ul>
        
        <h3>Information Sharing</h3>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
        
        <h3>Data Security</h3>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        
        <h3>Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@misika.com</p>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  };

  ApiResponse.success(res, privacyContent, 'Privacy policy fetched successfully');
});

// @desc    Get terms of service
// @route   GET /api/static/terms
// @access  Public
const getTermsOfService = asyncHandler(async (req, res) => {
  const termsContent = {
    title: "Terms of Service",
    content: `
      <div>
        <h2>Terms of Service</h2>
        <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3>Acceptance of Terms</h3>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3>Use License</h3>
        <p>Permission is granted to temporarily download one copy of the materials on Misika's website for personal, non-commercial transitory viewing only.</p>
        
        <h3>Disclaimer</h3>
        <p>The materials on Misika's website are provided on an 'as is' basis. Misika makes no warranties, expressed or implied.</p>
        
        <h3>Limitations</h3>
        <p>In no event shall Misika or its suppliers be liable for any damages arising out of the use or inability to use the materials on Misika's website.</p>
        
        <h3>Accuracy of Materials</h3>
        <p>The materials appearing on Misika's website could include technical, typographical, or photographic errors.</p>
        
        <h3>Contact Information</h3>
        <p>If you have any questions about these Terms of Service, please contact us at legal@misika.com</p>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  };

  ApiResponse.success(res, termsContent, 'Terms of service fetched successfully');
});

// @desc    Get shipping policy
// @route   GET /api/static/shipping
// @access  Public
const getShippingPolicy = asyncHandler(async (req, res) => {
  const shippingContent = {
    title: "Shipping Policy",
    content: `
      <div>
        <h2>Shipping Policy</h2>
        
        <h3>Shipping Methods</h3>
        <ul>
          <li><strong>Standard Delivery:</strong> 3-5 business days - ₹50</li>
          <li><strong>Express Delivery:</strong> 1-2 business days - ₹100</li>
          <li><strong>Premium Delivery:</strong> Same day delivery - ₹200</li>
        </ul>
        
        <h3>Free Shipping</h3>
        <p>Enjoy free standard shipping on orders above ₹999.</p>
        
        <h3>Processing Time</h3>
        <p>Orders are typically processed within 1-2 business days before shipping.</p>
        
        <h3>Delivery Areas</h3>
        <p>We currently deliver across India. Some remote areas may have extended delivery times.</p>
        
        <h3>Order Tracking</h3>
        <p>Once your order is shipped, you'll receive a tracking number to monitor your package.</p>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  };

  ApiResponse.success(res, shippingContent, 'Shipping policy fetched successfully');
});

module.exports = {
  getAbout,
  getServices,
  getPrivacyPolicy,
  getTermsOfService,
  getShippingPolicy
};