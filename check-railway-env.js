// Simple script to check if SUPERJARA_AUTH_NEW_KEY is set on Railway
// This will be called via an API endpoint

const express = require('express');
const app = express();

app.get('/check-env', (req, res) => {
  const hasToken = !!process.env.SUPERJARA_AUTH_NEW_KEY;
  const tokenLength = process.env.SUPERJARA_AUTH_NEW_KEY?.length || 0;
  const tokenPreview = process.env.SUPERJARA_AUTH_NEW_KEY?.substring(0, 10) || 'NOT SET';
  
  res.json({
    SUPERJARA_AUTH_NEW_KEY_exists: hasToken,
    token_length: tokenLength,
    token_preview: tokenPreview + '...',
    all_env_keys: Object.keys(process.env).filter(k => k.includes('SUPERJARA'))
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Env checker running on port ${PORT}`);
});
