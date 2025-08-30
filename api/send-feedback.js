const { Resend } = require('resend');

module.exports = async (req, res) => {
  try {
    // Basic validation
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, message } = req.body;
    
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }

    // Debug: Check environment variables
    const envVars = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    };

    res.status(200).json({ 
      message: 'Feedback received successfully!',
      received: { email, message },
      envVars,
      note: 'Email sending temporarily disabled for testing'
    });

  } catch (error) {
    console.error('Error in feedback function:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
