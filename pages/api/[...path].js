export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  
  try {
    const url = `${API_URL}/api/${apiPath}`;
    
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'username': req.headers.username || '',
        'password': req.headers.password || '',
      },
    };

    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to bot API. Make sure the Discord bot is running on port 3001.' 
    });
  }
}
