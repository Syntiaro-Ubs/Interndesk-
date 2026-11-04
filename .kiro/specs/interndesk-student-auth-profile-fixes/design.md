# InternDesk Student Auth & Profile Fixes - Bugfix Design

## Overview

This design addresses four critical security and data persistence bugs in the InternDesk student authentication and profile system. The bugs compromise password security (plain text storage), prevent profile customization persistence (photos and banners stored only in memory), and break resume viewing functionality (incorrect blob creation). The fix implements bcrypt password hashing, adds database columns for avatars and cover images, creates backend API endpoints for persistence, and corrects resume blob handling.

## Glossary

- **Bug_Condition (C)**: The set of inputs and states that trigger the four bugs - user registration/login, profile photo uploads, banner image uploads, and resume download attempts
- **Property (P)**: The desired correct behavior - secure password hashing with bcrypt, persistent photo/banner storage in database, and successful resume blob creation
- **Preservation**: Existing authentication flows, profile update mechanisms, and file upload handling that must remain unchanged
- **bcrypt**: Industry-standard password hashing library that uses adaptive hashing with salt
- **User Model**: The Sequelize model in `server/models/User.js` representing users table
- **authController**: The authentication controller in `server/controllers/authController.js` handling registration and login
- **profileData**: JSON field in users table storing extended profile information (currently stores avatar/cover in memory only)
- **ResumeAsset**: The model in `server/models/ResumeAsset.js` storing resume files as base64
- **dataBase64**: The field in resume_assets table containing base64-encoded resume data

## Bug Details

### Bug Condition

The bugs manifest in four distinct scenarios affecting authentication security and profile data persistence:

**Bug 1 - Password Hashing (CRITICAL SECURITY):**
User registers or logs in → passwords stored and compared in plain text → severe security vulnerability

**Bug 2 - Profile Photo Persistence:**
User uploads profile photo → image stored only in profileData JSON (memory) → photo lost on page reload

**Bug 3 - Banner Image Persistence:**
User uploads banner/cover image → image stored only in profileData JSON (memory) → banner lost on page reload

**Bug 4 - Resume Viewing:**
User attempts to download/view resume → blob creation fails with incorrect data → resume cannot be opened

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { action: string, data: any }
  OUTPUT: boolean
  
  RETURN (
    // Bug 1: Password operations without hashing
    (input.action === 'register' OR input.action === 'login') 
    AND passwordIsPlainText(input.data.password)
  ) OR (
    // Bug 2: Profile photo upload without persistence
    input.action === 'uploadAvatar'
    AND NOT existsColumn('users', 'avatar')
  ) OR (
    // Bug 3: Banner image upload without persistence
    input.action === 'uploadCover'
    AND NOT existsColumn('users', 'coverImage')
  ) OR (
    // Bug 4: Resume download with incorrect blob handling
    input.action === 'downloadResume'
    AND blobCreationFails(input.data.resumeKey)
  )
END FUNCTION
```

### Examples

**Bug 1 - Password Hashing:**
- **Input:** User registers with password "MyPassword123"
- **Current Behavior:** Password stored as "MyPassword123" in database
- **Security Risk:** Database breach exposes all passwords; admin can see user passwords
- **Expected:** Password stored as bcrypt hash "$2b$10$..."

**Bug 2 - Profile Photo:**
- **Input:** Student uploads profile photo (base64 data URL)
- **Current Behavior:** Stored in profileData JSON, lost on refresh
- **Expected:** Stored in `users.avatar` column, persists across sessions

**Bug 3 - Banner Image:**
- **Input:** Student uploads banner/cover image (base64 data URL)
- **Current Behavior:** Stored in profileData JSON, lost on refresh
- **Expected:** Stored in `users.coverImage` column, persists across sessions

**Bug 4 - Resume Download:**
- **Input:** Student clicks "View Resume" button
- **Current Behavior:** Blob creation fails, resume doesn't open
- **Expected:** Resume opens in new tab successfully

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- User registration flow for students, companies, and admins must continue to work
- Existing authentication token generation and session management must remain unchanged
- Profile update API for other fields (name, bio, education, skills) must continue functioning
- Resume upload process and storage mechanism must remain unchanged
- File upload handling for other profile sections must work as before
- All non-password user data access patterns must remain unchanged

**Scope:**
All inputs that do NOT involve the four specific bug scenarios should be completely unaffected by this fix. This includes:
- OAuth or social login flows (if any)
- Password reset functionality
- Profile data reads (except avatar/coverImage which will now come from new columns)
- Application submission and tracking
- Notification systems
- Admin user management (except password hashing applies universally)

## Hypothesized Root Cause

Based on the bug descriptions and codebase analysis, the root causes are:

### Bug 1 - Password Hashing Root Cause:
1. **Missing bcrypt Dependency**: The project doesn't have bcrypt installed
2. **No Hash Generation on Registration**: `authController.register()` stores password directly without hashing: `password: password` (line ~75)
3. **Plain Text Comparison on Login**: `authController.login()` compares passwords with `user.password !== password` (line ~150) instead of bcrypt.compare()
4. **No Migration Path**: Existing user passwords need re-hashing on next login

### Bug 2 & 3 - Photo/Banner Persistence Root Cause:
1. **Missing Database Columns**: Users table lacks `avatar` and `coverImage` TEXT columns
2. **Temporary Storage Only**: `StudentProfile.jsx` stores images via `persistProfileData()` which saves to profileData JSON field
3. **No Backend Endpoints**: No dedicated API routes for avatar/cover persistence
4. **Frontend Only Reads**: Images read from profileData on component mount but not persisted to database

### Bug 4 - Resume Download Root Cause:
1. **Incorrect Blob Construction**: `api.downloadResume()` in `api.js` (line ~386) calls `response.blob()` but the response may not be properly formatted
2. **Base64 Decoding Issue**: Backend returns base64 data but frontend doesn't decode before creating blob
3. **Missing Content-Type Header**: Resume endpoint may not set proper MIME type
4. **Route Fallback Logic**: Code tries two different endpoints with fallback, indicating route confusion

## Correctness Properties

Property 1: Bug Condition - Secure Password Storage and Authentication

_For any_ user registration or login attempt where a password is provided, the fixed authentication system SHALL use bcrypt to hash passwords during registration with salt rounds of 10, compare passwords during login using bcrypt.compare(), and never store or log plain text passwords.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Persistent Profile Photo Storage

_For any_ profile photo upload where a valid image data URL is provided, the fixed system SHALL store the image data in the users.avatar database column, return the saved value in subsequent profile API calls, and persist across page reloads and sessions.

**Validates: Requirements 2.4, 2.5**

Property 3: Bug Condition - Persistent Banner Image Storage

_For any_ banner/cover image upload where a valid image data URL is provided, the fixed system SHALL store the image data in the users.coverImage database column, return the saved value in subsequent profile API calls, and persist across page reloads and sessions.

**Validates: Requirements 2.6, 2.7**

Property 4: Bug Condition - Successful Resume Viewing

_For any_ resume download request where a valid resumeKey exists, the fixed system SHALL retrieve the base64 data from the database, decode it properly, create a blob with the correct MIME type, and enable the resume to open successfully in a new browser tab.

**Validates: Requirements 2.8, 2.9, 2.10**

Property 5: Preservation - Existing Authentication Flow

_For any_ authentication operation that does NOT involve password hashing logic (token generation, role checking, session management), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing authentication flows.

**Validates: Requirements 3.1**

Property 6: Preservation - Other Profile Fields

_For any_ profile update operation involving fields other than avatar and coverImage (name, bio, education, skills, etc.), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing profile update mechanisms.

**Validates: Requirements 3.2, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

#### **Change 1: Install bcrypt Dependency**

**File**: `package.json`

**Action**: Add bcrypt to dependencies

```bash
npm install bcrypt
```

**Specific Changes**:
1. Add `"bcrypt": "^5.1.1"` to dependencies section

---

#### **Change 2: Database Migration for Avatar and Cover Columns**

**File**: Create `server/migrations/add-avatar-cover-columns.js`

**Action**: Create migration script to add new columns

**Specific Changes**:
1. **Add avatar column**: TEXT type to store base64 image data
2. **Add coverImage column**: TEXT type to store base64 banner data
3. **Migration SQL**:
```sql
ALTER TABLE users 
ADD COLUMN avatar TEXT DEFAULT NULL,
ADD COLUMN coverImage TEXT DEFAULT NULL;
```

4. **Sequelize Model Update**: Update `server/models/User.js` to include:
```javascript
avatar: {
  type: DataTypes.TEXT,
  defaultValue: null
},
coverImage: {
  type: DataTypes.TEXT,
  defaultValue: null
}
```

---

#### **Change 3: Update authController with bcrypt Hashing**

**File**: `server/controllers/authController.js`

**Action**: Import bcrypt and modify register/login functions

**Specific Changes**:
1. **Add import**: `import bcrypt from 'bcrypt';` at top of file
2. **Modify register function** (around line 13-110):
   - Hash password before storage: `const hashedPassword = await bcrypt.hash(password, 10);`
   - Store hashed password: `password: hashedPassword` instead of `password: password`
   - Handle empty password case (OAuth users)
3. **Modify login function** (around line 121-203):
   - Replace plain text comparison `user.password !== password`
   - Use bcrypt comparison: `const isMatch = await bcrypt.compare(password, user.password);`
   - Handle legacy plain text passwords with migration logic (optional)
4. **Password update logic**: When updating existing user on re-registration:
   - Hash new password if provided: `password: password ? await bcrypt.hash(password, 10) : user.password`

---

#### **Change 4: Backend API Endpoints for Avatar and Cover**

**File**: `server/controllers/authController.js` (or create new `profileController.js`)

**Action**: Create/modify profile update endpoint to handle avatar and coverImage

**Specific Changes**:
1. **Modify `updateStudentProfile` or equivalent** to accept avatar and coverImage fields
2. **Validation**: Check that image data is valid base64 or data URL
3. **Size limit**: Enforce maximum size (e.g., 1.5MB) to prevent database bloat
4. **Update query**: Include avatar and coverImage in User.update() call
5. **Response**: Return saved avatar and coverImage in response

**Pseudocode**:
```javascript
export const updateProfile = async (req, res) => {
  const { avatar, coverImage, ...otherFields } = req.body;
  
  // Validate image size if provided
  if (avatar && Buffer.from(avatar.split(',')[1], 'base64').length > 1500000) {
    return res.status(400).json({ error: 'Avatar too large' });
  }
  
  if (coverImage && Buffer.from(coverImage.split(',')[1], 'base64').length > 1500000) {
    return res.status(400).json({ error: 'Cover image too large' });
  }
  
  await user.update({
    avatar: avatar !== undefined ? avatar : user.avatar,
    coverImage: coverImage !== undefined ? coverImage : user.coverImage,
    ...otherFields
  });
  
  return res.json({ success: true, avatar: user.avatar, coverImage: user.coverImage });
};
```

---

#### **Change 5: Update Profile Retrieval to Include Avatar and Cover**

**File**: `server/controllers/authController.js` (me function and studentProfile endpoint)

**Action**: Include avatar and coverImage in profile response

**Specific Changes**:
1. **Modify `me` function** (around line 204): Add avatar and coverImage to returned user object
2. **Modify `studentProfile` endpoint**: Return avatar and coverImage from users table, not just profileData
3. **Backward compatibility**: If profileData has avatar/cover but column is null, migrate it

---

#### **Change 6: Fix Resume Download Blob Creation**

**File**: `server/routes/applicationRoutes.js` or wherever resume endpoint is defined

**Action**: Create proper resume download endpoint with correct headers

**Specific Changes**:
1. **Add resume download route**: `GET /resumes/:resumeKey` or fix existing route
2. **Set correct headers**:
   - Content-Type: Use mimeType from ResumeAsset
   - Content-Disposition: attachment; filename="[fileName]"
3. **Return binary data**: Decode base64 and send as buffer, OR return base64 with proper Content-Type

**Alternative**: Fix frontend blob creation in `api.js`:

**File**: `src/app/api.js` (around line 375-388)

**Specific Changes**:
1. **Decode base64 to blob properly**:
```javascript
downloadResume: async (resumeKey) => {
  const profile = await api.studentProfile();
  const key = resumeKey || profile.resumeKey;
  if (!key) throw new ApiError('No uploaded resume was found.', 'RESUME_NOT_FOUND', 404);
  
  // Fetch resume asset data
  const response = await fetch(`${BASE_URL}/applications/resumes/${encodeURIComponent(key)}/data`, {
    headers: { 'X-User-Email': getCurrentUser()?.email || '' }
  });
  
  if (!response.ok) throw new ApiError('Could not load resume.', 'RESUME_LOAD_FAILED', response.status);
  
  const { dataBase64, mimeType, fileName } = await response.json();
  
  // Decode base64 to binary
  const binaryString = atob(dataBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create blob with correct MIME type
  return new Blob([bytes], { type: mimeType });
}
```

---

#### **Change 7: Frontend Profile Update Integration**

**File**: `src/app/pages/student/StudentProfile.jsx`

**Action**: Update persistProfileData to use new backend columns

**Specific Changes**:
1. **Modify `persistProfileData` function** (around line 103):
   - Send avatar and coverImage as top-level fields, not nested in profileData
   - Keep backward compatibility by also storing in profileData for non-critical data
2. **Update profile loading** (useEffect around line 62):
   - Read avatar from `saved.avatar` (column) first, fallback to `details.avatar` (JSON)
   - Read coverImage from `saved.coverImage` (column) first, fallback to `details.cover` (JSON)

**Pseudocode**:
```javascript
const persistProfileData = async (key, value) => {
  const payload = {};
  
  if (key === 'avatar' || key === 'cover') {
    // Send as top-level field for database column storage
    const columnName = key === 'cover' ? 'coverImage' : 'avatar';
    payload[columnName] = value;
  }
  
  // Also update profileData for backward compatibility
  const next = { ...profileData, [key]: value };
  payload.profileData = next;
  
  try {
    await api.updateStudentProfile(payload);
    setProfileData(next);
    if (key === 'avatar') setAvatarUrl(value);
    if (key === 'cover') setCoverUrl(value);
  } catch (error) {
    toast.error(error.message || 'Could not save this profile change.');
  }
};
```

---

#### **Change 8: Update API Client Student Profile Method**

**File**: `src/app/api.js`

**Action**: Ensure updateStudentProfile accepts avatar and coverImage

**Specific Changes**:
1. **Verify `updateStudentProfile` method** accepts avatar and coverImage parameters
2. **Ensure `studentProfile` response** includes avatar and coverImage fields from backend

## Testing Strategy

### Validation Approach

The testing strategy follows a three-phase approach: 
1. **Exploratory Bug Condition Checking** - surface counterexamples on unfixed code to confirm root causes
2. **Fix Checking** - verify all four bugs are resolved
3. **Preservation Checking** - ensure existing functionality remains unchanged

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate all four bugs BEFORE implementing fixes. Confirm or refute the root cause analysis for each bug.

**Test Plan**: Write tests that attempt all four buggy operations on UNFIXED code, observe failures, and validate hypothesized root causes.

**Test Cases**:

1. **Password Storage Test** (will fail on unfixed code):
   - Register new user with password "TestPassword123"
   - Query database directly and verify password is stored in plain text
   - Expected: Password field contains "TestPassword123" (security violation)

2. **Password Login Test** (will pass on unfixed but is insecure):
   - Login with correct plain text password
   - Expected: Login succeeds with plain text comparison

3. **Profile Photo Persistence Test** (will fail on unfixed code):
   - Upload profile photo via StudentProfile component
   - Refresh page and check if photo persists
   - Expected: Photo is lost (only stored in profileData JSON in memory)

4. **Banner Image Persistence Test** (will fail on unfixed code):
   - Upload cover/banner image via StudentProfile component
   - Refresh page and check if banner persists
   - Expected: Banner is lost (only stored in profileData JSON in memory)

5. **Resume Download Test** (will fail on unfixed code):
   - Upload a resume via profile
   - Click "View Resume" button
   - Expected: Blob creation fails, resume doesn't open

**Expected Counterexamples**:
- Database contains plain text passwords (security audit)
- Profile photos and banners disappear on page reload
- Resume download errors or fails to open
- Possible causes confirmed: missing bcrypt, missing DB columns, incorrect blob handling

### Fix Checking

**Goal**: Verify that for all inputs where bug conditions hold, the fixed functions produce expected secure behavior.

#### Bug 1 - Password Hashing Fix Check:

**Pseudocode:**
```
FOR ALL user registration WHERE password is provided DO
  hashedPassword := bcrypt.hash(password, 10)
  ASSERT hashedPassword starts with "$2b$10$"
  ASSERT hashedPassword !== password
  ASSERT database.users.password is hashed
END FOR

FOR ALL user login WHERE password is provided DO
  ASSERT bcrypt.compare(inputPassword, storedHash) is used
  ASSERT login succeeds only with correct password
  ASSERT plain text comparison is NOT used
END FOR
```

**Test Cases:**
1. Register user with password "SecurePass123" and verify:
   - Database stores bcrypt hash (starts with $2b$10$)
   - Hash is different on each registration (salt works)
   - Plain text password is never logged or stored

2. Login with correct password and verify:
   - bcrypt.compare() is called
   - Login succeeds

3. Login with wrong password and verify:
   - bcrypt.compare() returns false
   - Login fails with appropriate error

#### Bug 2 & 3 - Photo/Banner Persistence Fix Check:

**Pseudocode:**
```
FOR ALL image upload WHERE valid data URL is provided DO
  result := updateProfile({ avatar: dataUrl })
  ASSERT database.users.avatar === dataUrl
  ASSERT api.studentProfile().avatar === dataUrl
  ASSERT image persists after page reload
END FOR

FOR ALL banner upload WHERE valid data URL is provided DO
  result := updateProfile({ coverImage: dataUrl })
  ASSERT database.users.coverImage === dataUrl
  ASSERT api.studentProfile().coverImage === dataUrl
  ASSERT banner persists after page reload
END FOR
```

**Test Cases:**
1. Upload profile photo and verify:
   - Image saved to users.avatar column
   - Subsequent profile fetch returns avatar
   - Page reload shows avatar

2. Upload banner image and verify:
   - Image saved to users.coverImage column
   - Subsequent profile fetch returns coverImage
   - Page reload shows banner

3. Update profile photo multiple times and verify latest is saved

#### Bug 4 - Resume Download Fix Check:

**Pseudocode:**
```
FOR ALL resume download WHERE valid resumeKey exists DO
  blob := downloadResume(resumeKey)
  ASSERT blob.type === mimeType
  ASSERT blob.size > 0
  ASSERT URL.createObjectURL(blob) opens successfully
END FOR
```

**Test Cases:**
1. Upload PDF resume and verify:
   - Download creates valid blob
   - Blob has MIME type application/pdf
   - Opening blob URL displays PDF

2. Upload DOC resume and verify:
   - Download creates valid blob
   - Blob has correct MIME type
   - File downloads successfully

### Preservation Checking

**Goal**: Verify that for all operations NOT involving the four bugs, the fixed code produces the same results as the original code.

**Pseudocode:**
```
FOR ALL authentication operation WHERE operation is NOT (register OR login with password) DO
  ASSERT originalBehavior() === fixedBehavior()
END FOR

FOR ALL profile update WHERE field is NOT (avatar OR coverImage) DO
  ASSERT originalBehavior() === fixedBehavior()
END FOR

FOR ALL file operation WHERE operation is NOT resume download DO
  ASSERT originalBehavior() === fixedBehavior()
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different user roles and data
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that non-affected functionality is unchanged

**Test Plan**: Test all existing authentication and profile functionality on FIXED code to ensure no regressions.

**Test Cases:**

1. **Token Generation Preservation**: Verify token generation unchanged
   - Register user and check token format
   - Login and verify same token format
   - Verify token validation still works

2. **Role-Based Authentication Preservation**: Verify role restrictions unchanged
   - Student cannot access company routes
   - Company cannot access student routes
   - Admin restrictions work correctly

3. **Profile Fields Preservation**: Verify other profile updates work
   - Update name, bio, location
   - Update education, skills, projects
   - Update resume file (upload, not download)

4. **Company Registration Preservation**: Verify company accounts work
   - Register as company
   - Company profile updates
   - Company login

5. **Admin Authentication Preservation**: Verify admin access works
   - Admin login
   - Admin role restrictions
   - Admin portal access

### Unit Tests

**Password Hashing:**
- Test bcrypt.hash() with different passwords generates different hashes
- Test bcrypt.compare() with correct password returns true
- Test bcrypt.compare() with wrong password returns false
- Test empty password handling
- Test very long password (> 72 bytes) handling

**Avatar/Cover Persistence:**
- Test valid image upload saves to database
- Test oversized image (> 1.5MB) rejected
- Test invalid base64 data rejected
- Test null/undefined handling
- Test updating existing avatar/cover

**Resume Download:**
- Test valid resume key returns blob
- Test invalid resume key throws error
- Test blob has correct MIME type
- Test blob data integrity (compare with uploaded data)
- Test different file formats (PDF, DOC, DOCX)

### Property-Based Tests

**Password Security Properties:**
- Generate random valid passwords, verify all are hashed correctly
- Generate random password pairs, verify bcrypt comparison logic
- Test salt uniqueness across many registrations

**Image Persistence Properties:**
- Generate random valid image data URLs, verify all persist correctly
- Generate random user profiles, verify avatar/cover survive reload
- Test persistence across many update cycles

**Resume Handling Properties:**
- Generate random valid resume files, verify download always works
- Test blob creation across different MIME types
- Verify data integrity across encode/decode cycles

### Integration Tests

**Full Registration-Login-Profile Flow:**
1. Register user with password → verify hash stored
2. Login with password → verify bcrypt comparison works
3. Upload profile photo → verify persistence
4. Upload banner → verify persistence
5. Upload resume → verify download works
6. Logout and login again → verify all data persists

**Multi-User Scenario:**
1. Create multiple users with different roles
2. Each uploads profile photos, banners, resumes
3. Verify no data leakage between users
4. Verify each user can only access their own data

**Database Migration Test:**
1. Simulate existing database without avatar/coverImage columns
2. Run migration
3. Verify columns added
4. Verify existing data intact
5. Test new uploads work

**Backward Compatibility Test:**
1. Simulate users with profileData.avatar (old format)
2. Fetch profile and verify migration logic
3. Verify old data accessible
4. Verify new uploads use new columns
