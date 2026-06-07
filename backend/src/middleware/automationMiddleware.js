const ensureAutomationAuthorized = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.AUTOMATION_API_KEY) {
    req.user = { id: process.env.AUTOMATION_USER_ID || 1 };
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid or missing API Key' });
  }
};
module.exports = { ensureAutomationAuthorized };
