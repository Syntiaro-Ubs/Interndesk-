import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

// Ensure upload folders exist
const avatarsDir = path.join(uploadsDir, 'avatars');
const coversDir = path.join(uploadsDir, 'covers');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isCover = req.body?.type === 'cover' || req.query?.type === 'cover' || file.fieldname === 'cover';
    cb(null, isCover ? coversDir : avatarsDir);
  },
  filename: (req, file, cb) => {
    const isCover = req.body?.type === 'cover' || req.query?.type === 'cover' || file.fieldname === 'cover';
    const prefix = isCover ? 'cover' : 'avatar';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();
  if (allowed.test(ext) && (mime.startsWith('image/') || mime === 'application/octet-stream')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

export const uploadSingleImage = (req, res, next) => {
  uploadMiddleware.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error uploading file' });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

export const handlePhotoUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const isCover = req.body?.type === 'cover' || req.query?.type === 'cover' || req.file.fieldname === 'cover';
    const subfolder = isCover ? 'covers' : 'avatars';
    const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;

    const userEmail = req.headers['x-user-email'] || req.body?.email;
    if (userEmail) {
      try {
        const emailNorm = userEmail.toLowerCase().trim();
        const user = await User.findOne({ where: { email: emailNorm } });
        if (user) {
          let currentProfileData = {};
          try {
            currentProfileData = typeof user.profileData === 'string'
              ? JSON.parse(user.profileData || '{}')
              : (user.profileData || {});
          } catch {
            currentProfileData = {};
          }

          const updates = {};
          if (isCover) {
            updates.coverImage = fileUrl;
            currentProfileData.cover = fileUrl;
          } else {
            updates.avatar = fileUrl;
            currentProfileData.avatar = fileUrl;
          }
          updates.profileData = currentProfileData;

          await user.update(updates);
        }
      } catch (dbErr) {
        console.warn('[uploadController] Could not sync user in DB immediately:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      url: fileUrl,
      type: isCover ? 'cover' : 'avatar',
      fileName: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    console.error('handlePhotoUpload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload photo' });
  }
};
