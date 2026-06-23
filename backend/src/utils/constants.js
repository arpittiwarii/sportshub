/**
 * Global Constants for SportsHub Application
 * Centralized constants to avoid duplication across services
 */

// Allowed sports for athletes
const ALLOWED_SPORTS = [
    'Shot Put',
    'Long Jump',
    'High Jump',
    'Running 100m',
    'Running 400m',
    'Running 800m',
    'Running 1600m',
    'Other',
];

// User roles in the system
const USER_ROLES = {
    ADMIN: 'ADMIN',
    ATHLETE: 'ATHLETE',
    COACH: 'COACH',
};

// Athlete statuses
const ATHLETE_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

// Fee verification statuses
const FEE_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECT',
};

// Cloudinary folder paths
const CLOUDINARY_FOLDERS = {
    STUDENT_PROFILES: (studentId) => `sports-hub/students/${studentId}/profiles`,
    STUDENT_DOCS: (studentId) => `sports-hub/students/${studentId}`,
    ADMIN_PROFILES: (adminId) => `sports-hub/admin-profiles/${adminId}`,
    FEES: (feeId) => `sports-hub/fees/${feeId}`,
};

// File upload constraints
const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: new Set(['image/jpeg', 'image/png']),
    ALLOWED_DOCUMENT_TYPES: new Set(['image/jpeg', 'image/png', 'application/pdf']),
};

// Default admin credentials
const DEFAULT_ADMIN = {
    email: 'admin@sportshub.com',
    password: 'password123',
    name: 'Super Admin',
    role: 'ADMIN',
    age: 21,
    sports: 'Shot Put',
    status: 'APPROVED',
    contact: '8765432198',
};

module.exports = {
    ALLOWED_SPORTS,
    USER_ROLES,
    ATHLETE_STATUS,
    FEE_STATUS,
    CLOUDINARY_FOLDERS,
    FILE_UPLOAD,
    DEFAULT_ADMIN,
};
