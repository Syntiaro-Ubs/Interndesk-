# Implementation Plan

## Overview

This implementation plan addresses four critical bugs in the InternDesk student authentication and profile system:

1. **Bug 1: Password Hashing** - Passwords stored as plain text (security vulnerability) instead of using bcrypt hashing
2. **Bug 2: Profile Photo Persistence** - Profile photos stored only in localStorage, lost on page reload
3. **Bug 3: Banner Image Persistence** - Banner images stored only in localStorage, lost on page reload  
4. **Bug 4: Resume Viewing** - Resume download blob creation fails, preventing students from viewing uploaded resumes

The tasks follow the exploratory bugfix workflow:
- **Explore** - Write tests BEFORE fixes to understand each bug (Bug Condition tests)
- **Preserve** - Write tests for non-buggy behavior (Preservation tests)
- **Implement** - Apply fixes with understanding from exploration
- **Validate** - Verify fixes work and don't break anything

Each bug section includes exploration tests (Property 1: Bug Condition), preservation tests (Property 2: Preservation), implementation sub-tasks, and verification steps.

## Bug 1: Password Hashing Implementation

- [ ] 1.1 Write bug condition exploration test for password hashing
  - **Property 1: Bug Condition** - Plain Text Password Storage Security Vulnerability
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate passwords are stored in plain text
  - **Scoped PBT Approach**: Test registration with concrete password examples ("TestPassword123", "SecurePass456")
  - Test that when a user registers with a password, the database stores it as plain text (NOT hashed)
  - Test that when a user logs in, the system uses plain text comparison (`user.password !== password`)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the security vulnerability exists)
  - Document counterexamples found: specific passwords stored in plain text in database
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.2 Write preservation property tests for authentication (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Authentication Flows
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-student authentication flows
  - Test admin user login and verify authentication succeeds
  - Test company/employer user login and verify authentication succeeds
  - Test role-based access control (student cannot access company routes, etc.)
  - Test that admin users attempting to login via non-admin tabs are denied
  - Test that `/auth/me` endpoint returns current user information correctly
  - Write property-based tests capturing observed authentication patterns
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 1.3 Fix password hashing vulnerability

  - [ ] 1.3.1 Install bcrypt dependency
    - Run `npm install bcrypt` in the project root
    - Verify bcrypt version ^5.1.1 is added to package.json dependencies
    - _Requirements: 5.5_

  - [ ] 1.3.2 Update User model with password hashing
    - Modify `server/models/User.js`
    - Import bcrypt at the top: `const bcrypt = require('bcrypt');`
    - Add beforeCreate hook to hash password before saving new users
    - Add beforeUpdate hook to hash password if it's being changed
    - Use salt rounds of 10 for bcrypt hashing
    - _Bug_Condition: isBugCondition(input) where input.action === 'register' OR input.action === 'login' AND passwordIsPlainText(input.data.password)_
    - _Expected_Behavior: Passwords SHALL be hashed using bcrypt.hash(password, 10) before storage; login SHALL use bcrypt.compare() for verification_
    - _Preservation: User registration flow for students, companies, and admins must continue to work; token generation and session management must remain unchanged_
    - _Requirements: 5.1, 5.5_

  - [ ] 1.3.3 Update authController registration to hash passwords
    - Modify `server/controllers/authController.js` register function (around line 13-110)
    - Import bcrypt at the top: `const bcrypt = require('bcrypt');`
    - Replace direct password assignment with: `const hashedPassword = await bcrypt.hash(password, 10);`
    - Store hashedPassword instead of plain text: `password: hashedPassword`
    - Handle empty password case for OAuth users (keep existing logic)
    - When updating existing user on re-registration: `password: password ? await bcrypt.hash(password, 10) : user.password`
    - _Bug_Condition: User registers with password → password stored as plain text_
    - _Expected_Behavior: Password SHALL be hashed with bcrypt before database storage_
    - _Preservation: User registration flow must continue to work for all user types_
    - _Requirements: 5.1, 5.5_

  - [ ] 1.3.4 Update authController login to use bcrypt comparison
    - Modify `server/controllers/authController.js` login function (around line 121-203)
    - Replace plain text comparison `user.password !== password`
    - Use bcrypt comparison: `const isMatch = await bcrypt.compare(password, user.password);`
    - Update error handling: `if (!isMatch)` instead of password mismatch check
    - Handle case where user.password might be null (OAuth users)
    - Add legacy plain text password migration logic (optional): detect plain text, hash it, update database
    - _Bug_Condition: User logs in → system uses plain text comparison_
    - _Expected_Behavior: System SHALL use bcrypt.compare() to verify password against stored hash_
    - _Preservation: Login flow for all user types must continue to work; token generation must remain unchanged_
    - _Requirements: 5.2, 5.3_

  - [ ] 1.3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Secure Password Hashing with bcrypt
    - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
    - The test from task 1.1 encodes the expected behavior
    - When this test passes, it confirms passwords are hashed with bcrypt
    - Run bug condition exploration test from step 1.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms passwords are now hashed)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 1.3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Authentication Flows
    - **IMPORTANT**: Re-run the SAME tests from task 1.2 - do NOT write new tests
    - Run preservation property tests from step 1.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all authentication flows still work after password hashing implementation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 1.4 Checkpoint - Ensure password hashing tests pass
  - Verify all password hashing tests pass
  - Verify no regressions in authentication flows
  - Ask user if questions arise

## Bug 2 & 3: Profile Photo and Banner Image Persistence

- [ ] 2.1 Write bug condition exploration test for photo/banner persistence
  - **Property 1: Bug Condition** - Profile Images Not Persisting to Database
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate profile images are lost on page reload
  - **Scoped PBT Approach**: Test with concrete image uploads (valid base64 data URLs)
  - Test that when a student uploads a profile photo, it's stored only in profileData JSON (memory)
  - Test that when a student uploads a banner image, it's stored only in profileData JSON (memory)
  - Test that avatar and coverImage columns do NOT exist in users table
  - Test that after page refresh, uploaded images are lost
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves images don't persist)
  - Document counterexamples found: specific cases where images are lost on refresh
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

- [ ] 2.2 Write preservation property tests for profile management (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Profile Update Mechanisms
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-image profile updates
  - Test that updating name, firstName, lastName fields works correctly
  - Test that profileComplete status tracking works correctly
  - Test that localStorage is used appropriately for temporary UI state
  - Test that company employer profile updates work without affecting student profiles
  - Write property-based tests capturing observed profile update patterns
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 2.3 Fix profile photo and banner persistence

  - [ ] 2.3.1 Create database migration for avatar and coverImage columns
    - Create file `server/migrations/add-avatar-cover-columns.js`
    - Write migration SQL to add avatar column: `ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL;`
    - Write migration SQL to add coverImage column: `ALTER TABLE users ADD COLUMN coverImage TEXT DEFAULT NULL;`
    - Create rollback SQL to remove columns if needed
    - Document migration execution instructions
    - _Bug_Condition: Profile photo/banner upload when avatar/coverImage columns don't exist_
    - _Expected_Behavior: Database SHALL have avatar and coverImage TEXT columns to store image data_
    - _Preservation: All existing columns and data in users table must remain unchanged_
    - _Requirements: 6.5, 7.5, 12.1, 12.3_

  - [ ] 2.3.2 Run database migration
    - Execute the migration script created in 2.3.1
    - Verify avatar column exists in users table with type TEXT
    - Verify coverImage column exists in users table with type TEXT
    - Verify all existing user data is intact
    - _Requirements: 6.5, 7.5, 12.3_

  - [ ] 2.3.3 Update User model to include avatar and coverImage fields
    - Modify `server/models/User.js`
    - Add avatar field to model definition:
      ```javascript
      avatar: {
        type: DataTypes.TEXT,
        defaultValue: null
      }
      ```
    - Add coverImage field to model definition:
      ```javascript
      coverImage: {
        type: DataTypes.TEXT,
        defaultValue: null
      }
      ```
    - Ensure model associations remain unchanged
    - _Bug_Condition: Profile images uploaded but not persisted to database_
    - _Expected_Behavior: User model SHALL include avatar and coverImage fields for persistence_
    - _Preservation: All existing User model fields and associations must remain unchanged_
    - _Requirements: 6.1, 6.5, 7.1, 7.5, 12.2_

  - [ ] 2.3.4 Create/update backend API endpoint for avatar and coverImage updates
    - Modify `server/controllers/authController.js` or create new profile controller
    - Update/create `updateProfile` or `updateStudentProfile` endpoint
    - Accept avatar and coverImage fields in request body
    - Validate image data is valid base64 or data URL
    - Enforce maximum size limit (1.5MB) to prevent database bloat:
      ```javascript
      if (avatar && Buffer.from(avatar.split(',')[1], 'base64').length > 1500000) {
        return res.status(400).json({ error: 'Avatar too large' });
      }
      ```
    - Update User record with: `await user.update({ avatar, coverImage, ...otherFields });`
    - Return saved avatar and coverImage in response
    - _Bug_Condition: Profile images uploaded but no backend endpoint persists them_
    - _Expected_Behavior: Backend endpoint SHALL persist avatar and coverImage to database_
    - _Preservation: Other profile update mechanisms must continue working unchanged_
    - _Requirements: 6.2, 7.2_

  - [ ] 2.3.5 Update profile retrieval endpoints to include avatar and coverImage
    - Modify `server/controllers/authController.js` me function (around line 204)
    - Add avatar and coverImage to returned user object
    - Modify studentProfile endpoint to return avatar and coverImage from users table
    - Add backward compatibility: if profileData has avatar/cover but column is null, migrate it
    - Ensure response includes both new columns and existing profileData
    - _Bug_Condition: Profile images stored but not returned in API responses_
    - _Expected_Behavior: Profile endpoints SHALL return avatar and coverImage from database_
    - _Preservation: All other profile data retrieval must remain unchanged_
    - _Requirements: 6.3, 6.4, 7.3, 7.4_

  - [ ] 2.3.6 Update frontend StudentProfile to use new backend columns
    - Modify `src/app/pages/student/StudentProfile.jsx`
    - Update `persistProfileData` function (around line 103) to send avatar and coverImage as top-level fields:
      ```javascript
      const persistProfileData = async (key, value) => {
        const payload = {};
        if (key === 'avatar' || key === 'cover') {
          const columnName = key === 'cover' ? 'coverImage' : 'avatar';
          payload[columnName] = value;
        }
        const next = { ...profileData, [key]: value };
        payload.profileData = next;
        await api.updateStudentProfile(payload);
        setProfileData(next);
      };
      ```
    - Update profile loading (useEffect around line 62) to read from new columns first, fallback to profileData
    - Keep backward compatibility with profileData for non-critical data
    - _Bug_Condition: Frontend stores images only in localStorage/profileData_
    - _Expected_Behavior: Frontend SHALL persist images to database via backend API_
    - _Preservation: Other profile update functionality must remain unchanged_
    - _Requirements: 6.2, 6.3, 7.2, 7.3_

  - [ ] 2.3.7 Update API client to handle avatar and coverImage
    - Modify `src/app/api.js`
    - Verify `updateStudentProfile` method accepts avatar and coverImage parameters
    - Ensure `studentProfile` response includes avatar and coverImage fields from backend
    - Add proper error handling for oversized images
    - _Bug_Condition: API client doesn't handle avatar/coverImage persistence_
    - _Expected_Behavior: API client SHALL send and receive avatar/coverImage from backend_
    - _Preservation: All other API methods must remain unchanged_
    - _Requirements: 6.2, 6.3, 7.2, 7.3_

  - [ ] 2.3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Profile Images Persist to Database
    - **IMPORTANT**: Re-run the SAME test from task 2.1 - do NOT write a new test
    - The test from task 2.1 encodes the expected behavior
    - When this test passes, it confirms images persist across page reloads
    - Run bug condition exploration test from step 2.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms images now persist)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 2.3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Profile Update Mechanisms
    - **IMPORTANT**: Re-run the SAME tests from task 2.2 - do NOT write new tests
    - Run preservation property tests from step 2.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all other profile updates still work after image persistence implementation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 12.1, 12.2, 12.3_

- [ ] 2.4 Checkpoint - Ensure profile image persistence tests pass
  - Verify all profile image persistence tests pass
  - Verify no regressions in profile management
  - Test avatar upload and persistence across page reload
  - Test banner upload and persistence across page reload
  - Ask user if questions arise

## Bug 4: Resume Viewing Fix

- [ ] 3.1 Write bug condition exploration test for resume viewing
  - **Property 1: Bug Condition** - Resume Download Blob Creation Failure
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate resume viewing fails
  - **Scoped PBT Approach**: Test with concrete resume uploads (PDF, DOC files)
  - Test that when a student uploads a resume, it's stored in resume_assets table with base64 encoding
  - Test that when a student clicks to view/download resume, the blob creation fails
  - Test that the `/resumes/:key` endpoint doesn't exist or returns incorrect data
  - Test that base64 decoding or blob creation produces errors
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves resume viewing is broken)
  - Document counterexamples found: specific resume files that fail to open
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.2 Write preservation property tests for resume management (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Resume Upload and Storage
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for resume upload operations
  - Test that resume upload via application process stores files in resume_assets table
  - Test that employers can view student resumes from applications
  - Test that resume metadata (fileName, mimeType) is preserved correctly
  - Test that resume attachment to applications works correctly
  - Write property-based tests capturing observed resume handling patterns
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 3.3 Fix resume viewing blob creation

  - [ ] 3.3.1 Create/fix backend resume download endpoint
    - Create or modify resume download route in `server/routes/applicationRoutes.js` or appropriate file
    - Implement `GET /resumes/:resumeKey` endpoint or fix existing route
    - Retrieve ResumeAsset from database using resumeKey
    - Return resume with proper response format (either binary or JSON with base64)
    - Set correct Content-Type header from mimeType field
    - Set Content-Disposition header: `attachment; filename="${fileName}"`
    - Option 1: Decode base64 and send binary buffer
    - Option 2: Return JSON with { dataBase64, mimeType, fileName } for frontend decoding
    - Handle errors: resume not found, invalid key, decoding failures
    - _Bug_Condition: Resume download request where blob creation fails_
    - _Expected_Behavior: Backend SHALL return properly formatted resume data with correct headers_
    - _Preservation: Resume upload and storage mechanisms must remain unchanged_
    - _Requirements: 8.1, 8.5_

  - [ ] 3.3.2 Fix frontend resume download blob creation in api.js
    - Modify `src/app/api.js` downloadResume method (around line 375-388)
    - Update endpoint URL to match backend route (use correct path)
    - If backend returns JSON with base64, implement proper decoding:
      ```javascript
      const { dataBase64, mimeType, fileName } = await response.json();
      const binaryString = atob(dataBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: mimeType });
      ```
    - If backend returns binary, use `response.blob()` directly
    - Ensure blob has correct MIME type
    - Add proper error handling for missing resume key, network errors, and decoding failures
    - _Bug_Condition: Frontend blob creation fails or produces corrupted file_
    - _Expected_Behavior: Frontend SHALL create valid blob with correct MIME type for viewing/download_
    - _Preservation: Other API methods must remain unchanged_
    - _Requirements: 8.2, 8.3, 8.4_

  - [ ] 3.3.3 Add error handling and user feedback for resume operations
    - Improve error messages in api.js for resume download failures
    - Return clear error messages indicating: resume key not found, decoding failed, network error
    - Update UI components that trigger resume download to display errors properly
    - Test error scenarios: invalid key, missing resume, corrupted data
    - _Bug_Condition: Resume errors don't provide clear feedback_
    - _Expected_Behavior: System SHALL return clear error messages for resume operation failures_
    - _Preservation: Error handling for other operations must remain unchanged_
    - _Requirements: 8.6_

  - [ ] 3.3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Resume Download Creates Valid Blob
    - **IMPORTANT**: Re-run the SAME test from task 3.1 - do NOT write a new test
    - The test from task 3.1 encodes the expected behavior
    - When this test passes, it confirms resumes can be viewed/downloaded successfully
    - Run bug condition exploration test from step 3.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms resume viewing now works)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ] 3.3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Resume Upload and Storage
    - **IMPORTANT**: Re-run the SAME tests from task 3.2 - do NOT write new tests
    - Run preservation property tests from step 3.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm resume upload and storage mechanisms still work correctly
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 3.4 Checkpoint - Ensure resume viewing tests pass
  - Verify all resume viewing tests pass
  - Verify no regressions in resume upload and management
  - Test resume upload and successful viewing for PDF files
  - Test resume upload and successful viewing for DOC/DOCX files
  - Ask user if questions arise

## Final Integration Testing

- [ ] 4.1 Run complete integration test suite
  - Test full registration-login-profile flow with all four fixes
  - Register new student with password and verify bcrypt hashing
  - Login with password and verify authentication works
  - Upload profile photo and verify persistence across page reload
  - Upload banner image and verify persistence across page reload
  - Upload resume and verify successful viewing/download
  - Logout and login again to verify all data persists
  - _Requirements: All requirements 1.1-12.3_

- [ ] 4.2 Test multi-user scenarios
  - Create multiple users with different roles (student, company, admin)
  - Each user uploads profile photos, banners, and resumes
  - Verify no data leakage between users
  - Verify each user can only access their own data
  - Verify role-based access controls still work correctly
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.4_

- [ ] 4.3 Test backward compatibility
  - Test users with existing profileData.avatar (old format)
  - Verify migration logic handles old data correctly
  - Verify new uploads use new database columns
  - Test that existing user passwords (if any plain text remains) can be migrated
  - _Requirements: 6.3, 7.3, 12.3_

- [ ] 4.4 Final verification and documentation
  - Verify all four bugs are fixed and documented
  - Verify all preservation requirements are met
  - Update any relevant documentation (README, API docs)
  - Create summary of changes and testing results
  - Ask user to review and confirm all fixes are working as expected
