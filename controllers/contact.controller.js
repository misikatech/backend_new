const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');
const { sendEmail } = require('../utils/email');
const { contactSchema } = require('../validators/contact.validator');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  const { name, email, phone, subject, message } = req.body;

  // Save to database
  const contact = await prisma.contact.create({
    data: {
      name,
      email,
      phone,
      subject,
      message
    }
  });

  // Send notification email to admin
  try {
    await sendEmail({
      email: process.env.ADMIN_EMAIL || 'admin@misika.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
        </div>
      `
    });
  } catch (emailError) {
    console.error('Contact notification email error:', emailError);
  }

  ApiResponse.success(res, contact, 'Contact form submitted successfully', 201);
});

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.contact.count({ where })
  ]);

  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
    hasPrev: parseInt(page) > 1
  };

  ApiResponse.paginated(res, contacts, pagination, 'Contacts fetched successfully');
});

// @desc    Mark contact as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await prisma.contact.update({
    where: { id },
    data: { isRead: true }
  });

  ApiResponse.success(res, contact, 'Contact marked as read');
});

module.exports = {
  submitContact,
  getContacts,
  markAsRead
};