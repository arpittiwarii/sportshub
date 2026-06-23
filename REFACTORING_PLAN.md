# SportsHub Backend - Refactoring Migration Plan

## Phase 1: Foundation (No Breaking Changes)

### Step 1.1: Create Constants and Validation Layer
**Files to Create**:
- `utils/constants.js` - Extract `allowedSports`, allowed statuses
- `utils/validators.js` - Centralized validation schemas (optional - can use inline)

**What's Moved**:
- `allowedSports` array (from athelete.service.js, register.service.js)
- Allowed statuses (PENDING, APPROVED, REJECTED, etc.)

**Impact**: 0 API changes, just organization

---

### Step 1.2: Extend User Repository
**File to Modify**: `repositories/User.repository.js`

**Methods to Add**:
```javascript
// For login.service.js admin seeding
async function countAdminUsers() {
    return User.count({ where: { role: 'ADMIN' } });
}

async function findApprovedAthletes() {
    return User.findAll({ where: { role: 'ATHLETE', status: 'APPROVED' } });
}
```

**Impact**: 0 API changes, just new repository methods

---

## Phase 2: Service Layer Refactoring

### Step 2.1: Fix login.service.js
**Changes**:
- Replace `User.count()` with repository method
- Move admin seeding to startup logic (optional - keep in service for now)

**Before**:
```javascript
const adminCount = await User.count({ where: { role: 'ADMIN' } });
```

**After**:
```javascript
const adminCount = await countAdminUsers();
```

**Impact**: 0 API changes, better architecture

---

### Step 2.2: Fix fee.service.js  
**Changes**:
- Replace direct `User.findAll()` with repository method

**Before**:
```javascript
const athletes = await User.findAll({ where: { role: 'ATHLETE', status: 'APPROVED' } });
```

**After**:
```javascript
const athletes = await findApprovedAthletes();
```

**Impact**: 0 API changes, better architecture

---

## Phase 3: Controller Layer Refactoring

### Step 3.1: Create athleteProfile Service
**File to Create**: `services/athleteProfile.service.js`

**Methods**:
```javascript
async function updateAthleteProfileImage(athleteId, userId, fileBuffer) {
    // Validation
    // Authorization check (athleteId === userId)
    // Upload to Cloudinary
    // Update user in database via repository
    // Return updated profile
}
```

**Reason**: Extract image upload logic from controller

---

### Step 3.2: Create adminProfile Service
**File to Create**: `services/adminProfile.service.js`

**Methods**:
```javascript
async function getAdminProfile(adminId) { }
async function updateAdminProfileImage(adminId, fileBuffer) { }
async function updateStudentProfileImage(studentId, fileBuffer) { }
```

**Reason**: Extract image upload and profile operations from controller

---

### Step 3.3: Create athleteDocument Service
**File to Create**: `services/athleteDocument.service.js`

**Methods**:
```javascript
async function uploadStudentDocuments(athleteId, userId, files, afiId) {
    // Validation
    // Authorization check
    // Upload documents to Cloudinary
    // Update athlete via repository
    // Return updated athlete
}
```

**Reason**: Extract document upload logic from controller

---

### Step 3.4: Refactor athleteProfileController.js
**Changes**:
- Remove direct model access
- Call `athleteProfileService` instead
- Use `success()` utility for all responses
- Use `next(error)` for all errors

**Before**:
```javascript
const athlete = await User.findByPk(athleteId);
res.status(200).json(updated);
```

**After**:
```javascript
const athlete = await updateAthleteProfileImageService(athleteId, userId, buffer);
return success(res, athlete, 'Profile updated', 200);
```

---

### Step 3.5: Refactor adminProfileController.js
**Changes**:
- Remove direct model access
- Call `adminProfileService` instead
- Use `success()` utility for all responses
- Use `next(error)` for all errors

**Before**:
```javascript
const admin = await User.findByPk(adminId);
res.status(200).json(updated);
```

**After**:
```javascript
const admin = await updateAdminProfileImageService(adminId, buffer);
return success(res, admin, 'Profile updated', 200);
```

---

### Step 3.6: Refactor studentDocumentController.js
**Changes**:
- Remove direct model access
- Call `athleteDocumentService` instead
- Use `success()` utility for all responses
- Use `next(error)` for all errors

**Before**:
```javascript
const athlete = await User.findByPk(athleteId);
res.status(200).json(athleteWithoutPassword);
```

**After**:
```javascript
const athlete = await uploadStudentDocumentsService(athleteId, userId, files, afiId);
return success(res, athlete, 'Documents uploaded', 200);
```

---

## Phase 4: Validation and Testing

### Step 4.1: Verify All Imports Work
- All service imports resolve
- All repository imports resolve
- No circular dependencies

### Step 4.2: Test API Endpoints
```bash
# Auth endpoints
POST /api/auth/register
POST /api/auth/login

# Athlete endpoints
GET /api/athlete/:id
PUT /api/athlete/:id
PUT /api/athlete/:id/profile-image
PUT /api/athlete/:id/documents
PUT /api/athlete/:id/status

# Admin endpoints
GET /api/admin/profile
PUT /api/admin/profile
PUT /api/admin/students/:id/profile-image

# Fee endpoints
GET /api/payments
GET /api/payments/my-fees
POST /api/payments/generate
PUT /api/payments/:id/upload
PUT /api/payments/:id/verify

# Blog endpoints
GET /api/blogs
POST /api/blogs
PUT /api/blogs/:id
DELETE /api/blogs/:id
```

### Step 4.3: Verify Response Format
- All responses use standardized format
- All errors go through error handler
- No direct res.json() calls in controllers

---

## File Change Summary

### Files to Create (3):
1. `src/utils/constants.js` - Constants
2. `src/services/athleteProfile.service.js` - Service
3. `src/services/adminProfile.service.js` - Service
4. `src/services/athleteDocument.service.js` - Service

### Files to Modify (7):
1. `src/repositories/User.repository.js` - Add 2 methods
2. `src/services/login.service.js` - Fix 1 line
3. `src/services/fee.service.js` - Fix 1 line
4. `src/controllers/athleteProfileController.js` - Full refactor
5. `src/controllers/adminProfileController.js` - Full refactor
6. `src/controllers/studentDocumentController.js` - Full refactor
7. `src/services/athelete.service.js` - Update import

### Files Unchanged:
- authController.js
- athleteController.js
- blogController.js
- feeController.js
- authRoutes.js
- athleteRoutes.js
- feeRoutes.js
- blogRoutes.js
- Blog.repository.js
- Fee.repository.js
- All models
- All error classes
- Middleware

---

## Expected Outcomes

### Before Refactoring
```
❌ Controllers with DB access (3 files)
❌ Services with direct model usage (2 files)
❌ Inconsistent response handling (3 files)
❌ Mixed responsibilities (3 files)
❌ Duplicated validation logic
❌ Duplicated constants
```

### After Refactoring
```
✅ All layers separated
✅ Single responsibility principle
✅ Consistent response handling
✅ Centralized constants
✅ Centralized validation
✅ No direct model usage outside repositories
✅ All services call only repositories
✅ All controllers call only services
```

### API Behavior
```
✅ All endpoints work identically
✅ All response formats unchanged
✅ All request formats unchanged
✅ All authentication unchanged
✅ All authorization unchanged
✅ All business logic unchanged
✅ Database schema unchanged
```

---

## Risk Assessment

**Overall Risk**: ✅ LOW

**Why**:
- Architectural changes only, no business logic changes
- All route signatures preserved
- All response formats preserved
- Test coverage through existing API
- Can be rolled back easily

**Mitigation**:
- Test each endpoint after refactoring
- Keep git commits small and descriptive
- Verify imports after each change

