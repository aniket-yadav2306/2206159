import axios from 'axios';

export default async function handler(req, res) {
  const { path } = req.query;
  const targetUrl = `http://20.244.56.144/evaluation-service/${path.join('/')}`;

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: '20.244.56.144',
        origin: 'http://20.244.56.144',
        Authorization: req.headers.authorization,
      },
      data: req.body,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
} 