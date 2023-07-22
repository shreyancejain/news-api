const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const fetch = require('node-fetch');
const LRUCache = require('./lruCache');

const API_KEY = 'f00458f495209669e528200b3dce63e2'; // Hardcoded it here for now, Ideally it should come from environment variable
const logError = (err, res) => {
  console.error('Error Occurred while fetching articles and Error is : ', err);
  res.statusMessage = 'Something went wrong! Please contact support.';
  res.status(500).end();
};

const app = express();
const cache = new LRUCache(10); // Initialized cache with max 10 entries

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'news-api',
      version: '1.0.0',
    },
  },
  apis: ['app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /article:
 *   get:
 *     description: Get articles based on query parameters
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: |
 *           Number of articles to be fetched (P.S: Currently capped to 10, \
 *           Due to free GNews account. If more than 10 is passed api will still return 10 results) \
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: |
 *           String to search in article, Can be pass any valid query syntax defined https://gnews.io/docs/v4#query-syntax \
 *           (P.S: No need to wrap string in quotes, will work with or without it) \
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: |
 *           String to search in title of article, \
 *           Can be pass any valid query syntax defined https://gnews.io/docs/v4#query-syntax \
 *           It will override search query parameter if that is passed too \
 *           (P.S: No need to wrap string in quotes, will work with or without it) \
 *     responses:
 *       200:
 *         description: Success
 *
 */
app.get('/article', async (req, res) => {
  const limit = (req.query.limit || '').trim();
  const search = (req.query.search || '').trim();
  const title = (req.query.title || '').trim();
  let url = 'search';
  let queryParams = '';

  if (search) {
    queryParams = `q="${search}"&`;
  }

  if (title) {
    queryParams = `q="${title}"&in=title&`;
  }

  if (!queryParams) {
    // If not search or title parameters is passed top-headlines api is used since search can't be used with empty string
    url = 'top-headlines';
  }

  if (limit) {
    const max = parseInt(limit, 10);
    if (max <= 0 || !Number.isInteger(max)) {
      res.statusMessage = 'limit should be a positive integer';
      return res.status(400).end();
    }
    queryParams += `max=${limit}&`;
  }

  const cacheKey = `${url}?${queryParams}`;

  if (cache.has(cacheKey)) {
    // Returning cached result
    return res.send(cache.get(cacheKey));
  }

  try {
    const response = await fetch(`https://gnews.io/api/v4/${cacheKey}lang=en&apikey=${API_KEY}`);
    const data = await response.json();
    if (data.errors) {
      return logError(data.errors, res);
    }
    cache.set(cacheKey, data.articles);
    res.send(data.articles);
  } catch (err) {
    logError(err, res);
  }
});

app.listen(8080, () => {
  console.log('litening at 8080');
});
