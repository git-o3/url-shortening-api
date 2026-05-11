# 🔗 URL Shortening API
### AaaS Core Module — v1.0

A robust, RESTful API built with Node.js, Express, and MongoDB for shortening URLs and tracking real-time usage statistics. Designed as a foundation for "API as a Service" platforms with metered billing and usage tracking capabilities.

```
POST /api/v1/shorten        → { shortCode: "JT9McV" }
GET  /api/v1/shorten/JT9McV → original URL + increments accessCount
GET  /api/v1/shorten/JT9McV/stats → analytics data
```

---

## Features

- **Full CRUD** — Create, read, update, and delete shortened URLs
- **Atomic Access Counting** — `GET /:shortCode` increments `accessCount` in a single database operation using `$inc` — no race conditions
- **Analytics** — Dedicated `/stats` endpoint returns access count and timestamps per short code
- **Request Validation** — Middleware-based URL validation before hitting the controller
- **Centralized Error Handling** — All async errors bubble to a single global handler returning consistent JSON
- **Rate Limiting** — 100 requests per 15 minutes per IP on all shorten routes
- **Structured Logging** — Winston file logging + Morgan HTTP request logs with timestamps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v20+ (ES Modules) |
| Framework | Express.js |
| Database | MongoDB via Mongoose ODM |
| Short Code Generation | Nanoid (6-character codes) |
| HTTP Logging | Morgan |
| App Logging | Winston |
| Rate Limiting | express-rate-limit |

---

## Project Structure

```
url-shortening-api/
├── src/
│   ├── app.js                  # Express setup, middleware, routes
│   ├── config/
│   │   └── db.js               # Mongoose connection
│   ├── controllers/
│   │   └── urlController.js    # Request/response orchestration
│   ├── middleware/
│   │   ├── asyncHandler.js     # Wraps async controllers, forwards errors
│   │   ├── errorHandler.js     # Global error handler middleware
│   │   ├── morganMiddleware.js # HTTP request logging
│   │   └── rateLimiter.js      # IP-based rate limiting
│   ├── models/
│   │   └── url.js              # Mongoose schema (url, shortCode, accessCount)
│   ├── routes/
│   │   └── urlRoutes.js        # Route definitions
│   ├── services/
│   │   └── urlService.js       # All database logic
│   ├── validators/
│   │   └── validator.js        # URL presence validation middleware
│   └── utils/
│       └── logger.js           # Winston logger instance
├── logs/
│   ├── error.log               # Error-level logs
│   └── combined.log            # All logs
├── .env
├── package.json
└── server.js                   # Entry point
```

---

## Environment Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/shortenDB
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shortenDB
```

---

## Local Setup

**1. Clone and install:**

```bash
git clone https://github.com/git-o3/url-shortening-api.git
cd url-shortening-api
npm install
```

**2. Create logs directory:**

```bash
mkdir logs
```

**3. Start the development server:**

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

**4. Verify it's running:**

```bash
curl http://localhost:3000/api/v1/health
# OK
```

---

## API Reference

### Health Check

```
GET /api/v1/health
```
Returns `200 OK` if the server is running.

---

### Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/shorten` | List all shortened URLs | — |
| `POST` | `/api/v1/shorten` | Create a new short URL | — |
| `GET` | `/api/v1/shorten/:shortCode` | Resolve short code + increment count | — |
| `GET` | `/api/v1/shorten/:shortCode/stats` | View analytics for a short code | — |
| `PUT` | `/api/v1/shorten/:shortCode` | Update destination URL | — |
| `DELETE` | `/api/v1/shorten/:shortCode` | Remove a short URL | — |

---

### Create a Short URL

```
POST /api/v1/shorten
Content-Type: application/json
```

**Request body:**
```json
{
  "url": "https://www.google.com"
}
```

**Response `201`:**
```json
{
  "url": "https://www.google.com",
  "shortCode": "JT9McV",
  "accessCount": 0,
  "_id": "6a019f40...",
  "createdAt": "2026-05-10T19:37:38.000Z",
  "updatedAt": "2026-05-10T19:37:38.000Z"
}
```

---

### List All URLs

```
GET /api/v1/shorten
```

**Response `200`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "url": "https://google.com", "shortCode": "JT9McV", "accessCount": 14 },
    { "url": "https://github.com", "shortCode": "xK2pQr", "accessCount": 3 }
  ]
}
```

---

### Resolve a Short Code

```
GET /api/v1/shorten/:shortCode
```

Fetches the entry and atomically increments `accessCount` by 1 in a single database operation.

**Response `200`:**
```json
{
  "url": "https://www.google.com",
  "shortCode": "JT9McV",
  "accessCount": 15,
  "createdAt": "2026-05-10T19:37:38.000Z"
}
```

---

### View Analytics

```
GET /api/v1/shorten/:shortCode/stats
```

Returns the full document without incrementing the counter.

**Response `200`:**
```json
{
  "url": "https://www.google.com",
  "shortCode": "JT9McV",
  "accessCount": 15,
  "createdAt": "2026-05-10T19:37:38.000Z",
  "updatedAt": "2026-05-10T20:01:12.000Z"
}
```

---

### Update Destination URL

```
PUT /api/v1/shorten/:shortCode
Content-Type: application/json
```

**Request body:**
```json
{
  "url": "https://www.new-destination.com"
}
```

**Response `204`:** No content.

---

### Delete a Short URL

```
DELETE /api/v1/shorten/:shortCode
```

**Response `204`:** No content.

---

## Error Handling

All errors return a consistent JSON shape via the global error handler:

```json
{
  "success": false,
  "message": "Short code not found"
}
```

| Status | Meaning | Trigger |
|---|---|---|
| `400` | Bad Request | Missing or invalid URL in request body |
| `404` | Not Found | Short code does not exist in the database |
| `429` | Too Many Requests | Rate limit exceeded (100 req / 15 min per IP) |
| `500` | Internal Server Error | Database failure or unhandled exception |

Errors are thrown from the service layer with a `statusCode` property and caught by `asyncHandler`, which forwards them to the `globalErrorHandler` middleware — no try/catch needed in controllers.

---

## Design Decisions

**Atomic access counting** — `getByCode` with `increment: true` uses `findOneAndUpdate` with `$inc` rather than fetch → modify → save. This prevents double-counting under concurrent requests and is a single round trip to the database.

**Service layer owns all DB logic** — Controllers never touch Mongoose directly. This makes the service layer independently testable and keeps controllers thin (read params → call service → send response).

**Nanoid over UUID for short codes** — `nanoid(6)` generates a 6-character URL-safe code (`JT9McV`). UUID would produce `c51b4e4c-178b-4acf-90e3-5434804293d0` — far too long for a URL shortener.

**`validateUrl` as middleware** — Validation runs before the controller via `router.post('/', validateUrl, createUrl)`. If the URL is missing, a `400` is thrown before any database call is made.

**204 on update/delete** — `PUT` and `DELETE` return `204 No Content` rather than the modified document. The client already knows what it sent; repeating it back wastes bandwidth and is not RESTful convention for destructive operations.

---

## Known Limitations

- **No redirect** — `GET /:shortCode` returns JSON rather than a `301/302` redirect to the destination URL. Add `res.redirect(entry.url)` to `getUrl` for browser-based link shortening
- **No collision handling** — Nanoid(6) has ~68 billion combinations but no retry logic if a duplicate short code is generated
- **No authentication** — All endpoints are public; no API key or user session layer yet
- **No TTL** — Short URLs never expire; add a `expiresAt` field and a MongoDB TTL index for expiry support

---

## License

MIT



Project URL: https://roadmap.sh/projects/url-shortening-service