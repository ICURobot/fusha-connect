module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Test API working!',
    method: req.method,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
};

