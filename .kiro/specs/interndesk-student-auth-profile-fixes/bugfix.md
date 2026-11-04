# Bugfix Requirements Document

## Introduction

This document addresses four critical bugs in the InternDesk student system that severely impact user experience and security. These bugs prevent students from logging in after initial signup, losing their profile customizations on page refresh, and being unable to view uploaded resumes. The root causes include insecure plain-text password storage (security vulnerability), localStorage-only persistence for profile data (no database storage), and incorrect resume retrieval logic. Fixing these issues will ensure proper authentication, data persistence, and document management for all student users.

## Bug Analysis

### Current Behavior (Defect)

#### Bug 1: Authentication Failure After Initial Signup

1.1 WHEN a student successfully registers with email and password THEN the system stores the password as plain text in the database without hashing

1.2 WHEN a student logs in immediately after registration THEN the system successfully authenticates using plain text password comparison (`user.password !== password`)

1.3 WHEN a student logs out and attempts to login again with the same credentials THEN the system may fail authentication due to password comparison issues (whitespace, case sensitivity, or session handling)

1.4 WHEN passwords are stored and compared as plain text THEN the system exposes a critical security vulnerability allowing unauthorized access if the database is compromised

#### Bug 2: Profile Photo Not Persisting

2.1 WHEN a student uploads a profile photo via the StudentProfile interface THEN the system stores the photo as base64 in localStorage under the "interndesk_studentProfile" key

2.2 WHEN a student uploads a profile photo THEN the system does not persist the photo to the users database table because avatar/coverImage columns do not exist

2.3 WHEN a student refreshes the page or logs in from a different browser THEN the system loses the profile photo because it was only stored in localStorage

2.4 WHEN other users view the student's profile THEN the system cannot display the profile photo because it only exists in the original user's browser localStorage

#### Bug 3: Banner Image Not Persisting

3.1 WHEN a student uploads a custom banner/cover image via the StudentProfile interface THEN the system stores the image as base64 in localStorage under the "interndesk_studentProfile" key

3.2 WHEN a student uploads a banner image THEN the system does not persist the image to the users database table because avatar/coverImage columns do not exist

3.3 WHEN a student refreshes the page or logs in from a different browser THEN the system loses the banner image because it was only stored in localStorage

3.4 WHEN other users view the student's profile THEN the system cannot display the banner image because it only exists in the original user's browser localStorage

#### Bug 4: Uploaded Resume Not Viewable

4.1 WHEN a student uploads a resume file via `api.uploadResume()` THEN the system stores it in the resume_assets table with base64 encoding

4.2 WHEN a student clicks to view/download their uploaded resume THEN the system calls `api.downloadResume()` which fetches from `/resumes/:key` endpoint

4.3 WHEN the `/resumes/:key` endpoint does not exist or fails to retrieve the resume THEN the system attempts fallback to `/applications/resumes/:key` endpoint

4.4 WHEN both endpoints fail or return incorrect data THEN the student sees an error and cannot view their uploaded resume

4.5 WHEN the resume base64 data is retrieved but improperly decoded or the blob is incorrectly created THEN the student sees a corrupted file or download failure

### Expected Behavior (Correct)

#### Bug 1: Secure Authentication with Password Hashing

5.1 WHEN a student registers with email and password THEN the system SHALL hash the password using bcrypt before storing it in the database

5.2 WHEN a student logs in with valid credentials THEN the system SHALL use bcrypt.compare() to verify the password against the stored hash

5.3 WHEN a student logs in multiple times with the same credentials THEN the system SHALL successfully authenticate each time using secure password comparison

5.4 WHEN passwords are hashed with bcrypt THEN the system SHALL protect user credentials even if the database is compromised

5.5 WHEN implementing password hashing THEN the system SHALL use a salt rounds value of at least 10 for bcrypt

#### Bug 2: Profile Photo Database Persistence

6.1 WHEN a student uploads a profile photo THEN the system SHALL store the photo as base64 or file path in the users.avatar column

6.2 WHEN a student uploads a profile photo THEN the system SHALL persist the photo via a backend API endpoint that updates the database

6.3 WHEN a student refreshes the page or logs in from any browser THEN the system SHALL retrieve and display the profile photo from the database

6.4 WHEN other users view the student's profile THEN the system SHALL display the profile photo retrieved from the database

6.5 WHEN the users table is altered THEN the system SHALL add an `avatar` column of type TEXT or VARCHAR(2048) to store base64 data or file URLs

#### Bug 3: Banner Image Database Persistence

7.1 WHEN a student uploads a banner/cover image THEN the system SHALL store the image as base64 or file path in the users.coverImage column

7.2 WHEN a student uploads a banner image THEN the system SHALL persist the image via a backend API endpoint that updates the database

7.3 WHEN a student refreshes the page or logs in from any browser THEN the system SHALL retrieve and display the banner image from the database

7.4 WHEN other users view the student's profile THEN the system SHALL display the banner image retrieved from the database

7.5 WHEN the users table is altered THEN the system SHALL add a `coverImage` column of type TEXT or VARCHAR(2048) to store base64 data or file URLs

#### Bug 4: Resume Viewing with Proper Retrieval

8.1 WHEN a student requests to view/download their uploaded resume THEN the system SHALL retrieve the resume data from the resume_assets table using the resumeKey

8.2 WHEN the resume data is retrieved THEN the system SHALL properly decode the base64 dataBase64 field into binary data

8.3 WHEN the binary data is decoded THEN the system SHALL create a Blob with the correct mimeType from the resume_assets record

8.4 WHEN the Blob is created THEN the system SHALL return it to the frontend for viewing or download with appropriate content-type headers

8.5 WHEN resume retrieval endpoints are implemented THEN the system SHALL ensure either `/resumes/:key` or `/applications/resumes/:key` properly serves resume files

8.6 WHEN resume serving fails THEN the system SHALL return clear error messages indicating whether the resume key was not found or decoding failed

### Unchanged Behavior (Regression Prevention)

#### Authentication

9.1 WHEN an admin user logs in with valid credentials THEN the system SHALL CONTINUE TO authenticate admin users correctly

9.2 WHEN a company/employer user logs in with valid credentials THEN the system SHALL CONTINUE TO authenticate employer users correctly

9.3 WHEN role-based access control validates user roles THEN the system SHALL CONTINUE TO enforce strict partition between student, company, and admin accounts

9.4 WHEN a user with role='admin' attempts to login via non-admin tabs THEN the system SHALL CONTINUE TO deny access with appropriate error message

9.5 WHEN OTP/email verification is triggered THEN the system SHALL CONTINUE TO function correctly for email-based authentication flows

9.6 WHEN the `/auth/me` endpoint is called THEN the system SHALL CONTINUE TO return current user information without requiring password re-validation

#### Profile Management

10.1 WHEN a student updates their name, firstName, or lastName fields THEN the system SHALL CONTINUE TO save these text fields correctly

10.2 WHEN a student's profileComplete status is checked THEN the system SHALL CONTINUE TO track profile completion status

10.3 WHEN localStorage is used for temporary UI state (not persistent data) THEN the system SHALL CONTINUE TO use localStorage appropriately

10.4 WHEN a company employer updates their company profile THEN the system SHALL CONTINUE TO update company information without affecting student profiles

#### Resume Management

11.1 WHEN a student uploads a new resume file via the application process THEN the system SHALL CONTINUE TO store it in the resume_assets table

11.2 WHEN an employer views a student's resume from an application THEN the system SHALL CONTINUE TO serve the resume via the application resume endpoints

11.3 WHEN resume metadata (fileName, mimeType) is stored THEN the system SHALL CONTINUE TO preserve the original file name and MIME type

11.4 WHEN a student applies to an internship with a resume THEN the system SHALL CONTINUE TO attach the resume to the application correctly

#### Database Schema

12.1 WHEN existing columns in the users table are queried THEN the system SHALL CONTINUE TO return all existing fields (id, email, name, firstName, lastName, role, companyId, etc.)

12.2 WHEN Sequelize model associations are used THEN the system SHALL CONTINUE TO maintain relationships between User, Company, Application, and other models

12.3 WHEN database migrations are run THEN the system SHALL CONTINUE TO preserve all existing data in the users and resume_assets tables
