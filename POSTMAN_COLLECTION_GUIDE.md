# SportsHub API - Postman Collection Guide

## Collection Details
- **File:** `SportsHub-API-Collection.postman_collection.json`
- **Format:** Postman Collection v2.1
- **Total Endpoints:** 21 API endpoints
- **Base URL:** `http://localhost:8000/api`

## Quick Start

### 1. Import Collection into Postman
- Open Postman
- Click **Import** (top-left)
- Select the `SportsHub-API-Collection.postman_collection.json` file
- Collection will appear in your workspace

### 2. Set Up Environment Variables
In Postman, create an environment with these variables:
```
baseUrl = http://localhost:8000/api
token = (leave empty initially)
```

### 3. Authenticate
1. Go to **Authentication > Login**
2. Use default admin credentials:
   - Email: `admin@sportshub.com`
   - Password: `password123`
3. Send the request
4. Token will auto-populate in the `token` environment variable

## API Endpoints Summary

### Authentication (Public)
- `POST /auth/register` - Register new athlete
- `POST /auth/login` - Login and get JWT token

### Athletes (Protected/Admin)
- `GET /athlete` - Get all athletes (Admin only)
- `GET /athlete/:id` - Get athlete by ID
- `PUT /athlete/:id` - Update athlete profile
- `PUT /athlete/:id/profile-image` - Upload profile image
- `PUT /athlete/:id/documents` - Upload birth cert & aadhar
- `PUT /athlete/:id/status` - Update athlete status (Admin)
- `DELETE /athlete/:id` - Delete athlete (Admin only)

### Admin (Protected)
- `GET /admin/profile` - Get admin profile
- `PUT /admin/profile` - Update admin profile
- `PUT /admin/students/:id/profile-image` - Update student profile image

### Payments/Fees (Protected)
- `GET /payments/my-fees` - Get athlete's fees
- `GET /payments` - Get all fees (Admin only)
- `POST /payments/generate` - Generate monthly fees (Admin)
- `PUT /payments/:id/upload` - Upload fee proof
- `PUT /payments/:id/verify` - Verify fee (Admin only)

### Blogs (Public/Protected)
- `GET /blogs` - Get all blogs (Public)
- `POST /blogs` - Create blog (Admin only)
- `PUT /blogs/:id` - Update blog (Admin only)
- `DELETE /blogs/:id` - Delete blog (Admin only)

## Request Body Examples

### Register
```json
{
  "name": "John Athlete",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "age": 22,
  "sports": "Cricket",
  "contact": "9876543210",
  "school": "Central School",
  "afiId": "AFI12345"
}
```

### Login
```json
{
  "email": "admin@sportshub.com",
  "password": "password123"
}
```

### Update Athlete
```json
{
  "name": "John Updated",
  "age": 23,
  "sports": "Cricket",
  "contact": "9876543210",
  "school": "Central School",
  "afiId": "AFI12345"
}
```

### Update Athlete Status
```json
{
  "status": "APPROVED"
}
```
Valid values: `PENDING`, `APPROVED`, `REJECT`

### Generate Monthly Fees
```json
{
  "amount": 5000,
  "month": "June",
  "year": 2026
}
```

### Verify Fee
```json
{
  "status": "APPROVED"
}
```
Valid values: `APPROVED`, `REJECT`

### Create Blog
```json
{
  "title": "Training Tips",
  "content": "Detailed blog content...",
  "author": "Admin",
  "description": "Blog description"
}
```

## File Upload Endpoints

### Update Profile Image
- Field: `profileImage`
- Accepted: JPG, PNG
- Endpoint: `/athlete/:id/profile-image` or `/admin/profile`

### Upload Student Documents
- Fields: `birthCertificate`, `aadharCard`
- Accepted: JPG, PNG
- Endpoint: `/athlete/:id/documents`

### Upload Fee Proof
- Field: `screenshot`
- Accepted: JPG, PNG
- Max Size: 5MB
- Endpoint: `/payments/:id/upload`

## Protected Routes

Routes requiring authentication use Bearer Token:
```
Authorization: Bearer {{token}}
```

All requests to protected routes automatically include this header via the collection's authentication settings.

## Role-Based Access Control

### ATHLETE
- View own profile
- Update own profile
- Upload own documents and profile image
- View own fees
- Upload fee proof

### ADMIN
- View all athletes
- Update athlete status
- Delete athletes
- View all fees
- Generate monthly fees
- Verify fees
- Manage admin profile
- Create/Update/Delete blogs
- Update student profile images

### PUBLIC
- Login/Register (no auth required)
- View blogs

## Testing Workflow

1. **Register a new athlete**
   - POST `/auth/register`
   - Save the athlete ID

2. **Wait for admin approval** (or login as admin to approve)
   - PUT `/athlete/:id/status` with `{"status": "APPROVED"}`

3. **Login as athlete**
   - POST `/auth/login`
   - Save the token

4. **Upload documents**
   - PUT `/athlete/:id/documents`

5. **Check fees**
   - GET `/payments/my-fees`

6. **Upload fee proof**
   - PUT `/payments/:id/upload`

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- All timestamps use ISO 8601 format
- Soft deletes are enabled (paranoid mode)
- Cloudinary is used for file uploads
- JWT tokens expire after a certain period (check backend config)
- Default admin is auto-created on first login if missing
