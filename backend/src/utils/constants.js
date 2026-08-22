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
    REJECTED: 'REJECTED',
};

// What a one-time password was issued for. Codes are scoped to a purpose so a
// password-reset code can never be replayed against the email-verification
// endpoint (or vice versa), and issuing one does not invalidate the other.
const OTP_PURPOSE = {
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    PASSWORD_RESET: 'PASSWORD_RESET',
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

module.exports = {
    ALLOWED_SPORTS,
    USER_ROLES,
    ATHLETE_STATUS,
    FEE_STATUS,
    OTP_PURPOSE,
    CLOUDINARY_FOLDERS,
    FILE_UPLOAD,
};
