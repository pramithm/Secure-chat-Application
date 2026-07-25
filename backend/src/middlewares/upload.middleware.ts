import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const blockedExtensions = ['.exe', '.apk', '.zip', '.rar', '.bat', '.sh', '.cmd'];

  if (blockedExtensions.includes(ext)) {
    return cb(new Error('Security Alert: Executables, archives (ZIP/RAR) and scripts are strictly forbidden.'));
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/webm',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'octet-stream'
  ];

  if (allowedTypes.includes(file.mimetype) || ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.webp', '.webm', '.wav', '.mp3'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: Images, Voice Notes, PDF, DOCX.'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter
});
