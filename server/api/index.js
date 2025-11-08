import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { GridFSBucket, ObjectId } from 'mongodb';
import stream from 'stream';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  }),
);

// Config
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const conn = mongoose.connection;
let gfsBucket;

conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'prescriptionsFiles' });
  console.log('MongoDB connected and GridFSBucket ready');
});

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

const MetaSchema = new mongoose.Schema({
  userId: String,
  filename: String,
  fileId: mongoose.Schema.Types.ObjectId,
  contentType: String,
  doctor: String,
  date: String,
  createdAt: { type: Date, default: Date.now },
});
const Meta = mongoose.model('PrescriptionMeta', MetaSchema);

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Auth routes
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email & password required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email format' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = await User.create({ email, password });
    return res.json({
      id: user._id,
      email: user.email,
      message: 'User created successfully',
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000)
      return res.status(400).json({ error: 'User already exists' });
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    return res.json({
      id: user._id,
      email: user.email,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { userId, doctor = '', date = '' } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
      metadata: { uploadedBy: userId, originalName: req.file.originalname },
      contentType: req.file.mimetype,
    });

    bufferStream
      .pipe(uploadStream)
      .on('error', (err) => {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
      })
      .on('finish', async () => {
        const meta = await Meta.create({
          userId: userId.toString(),
          filename: req.file.originalname,
          fileId: uploadStream.id,
          contentType: req.file.mimetype,
          doctor,
          date,
        });

        res.json({
          success: true,
          metaId: meta._id,
          filename: req.file.originalname,
          message: 'File uploaded successfully',
        });
      });
  } catch (err) {
    console.error('Upload exception:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// List files route
app.get('/files', async (req, res) => {
  try {
    const { userId } = req.query;

    console.log('Files API called with userId:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const docs = await Meta.find({ userId: userId.toString() })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${docs.length} files for user ${userId}`);

    const formattedDocs = docs.map((doc) => ({
      id: doc._id,
      filename: doc.filename,
      doctor: doc.doctor || 'Unknown Doctor',
      date: doc.date || new Date(doc.createdAt).toISOString().split('T')[0],
      createdAt: doc.createdAt,
      contentType: doc.contentType,
    }));

    res.json(formattedDocs);
  } catch (err) {
    console.error('List files error:', err);
    res.status(500).json({
      error: 'Failed to fetch files: ' + err.message,
      details: 'Database query failed',
    });
  }
});

// Download route
app.get('/file/:metaId', async (req, res) => {
  try {
    const meta = await Meta.findById(req.params.metaId);
    if (!meta) return res.status(404).json({ error: 'File not found' });

    const fileId =
      meta.fileId instanceof ObjectId ? meta.fileId : new ObjectId(meta.fileId);

    res.setHeader(
      'Content-Type',
      meta.contentType || 'application/octet-stream',
    );
    res.setHeader('Content-Disposition', `inline; filename="${meta.filename}"`);

    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res).on('error', (err) => {
      console.error('Download error:', err);
      if (!res.headersSent)
        res.status(404).json({ error: 'File not found in storage' });
    });
  } catch (err) {
    console.error('Download exception:', err);
    if (!res.headersSent)
      res.status(500).json({ error: 'Download failed: ' + err.message });
  }
});

// Edit route
app.put('/file/:metaId', async (req, res) => {
  try {
    const { metaId } = req.params;
    const { doctor, date } = req.body;

    if (!doctor || !date) {
      return res
        .status(400)
        .json({ error: 'Doctor name and date are required' });
    }

    const meta = await Meta.findById(metaId);
    if (!meta) return res.status(404).json({ error: 'File not found' });

    meta.doctor = doctor;
    meta.date = date;
    await meta.save();

    res.json({ success: true, message: 'File metadata updated successfully' });
  } catch (err) {
    console.error('Edit error:', err);
    res.status(500).json({ error: 'Edit failed: ' + err.message });
  }
});

// Delete route
app.delete('/file/:metaId', async (req, res) => {
  try {
    const meta = await Meta.findById(req.params.metaId);
    if (!meta) return res.status(404).json({ error: 'File not found' });

    const fileId =
      meta.fileId instanceof ObjectId ? meta.fileId : new ObjectId(meta.fileId);
    await gfsBucket.delete(fileId);
    await Meta.deleteOne({ _id: meta._id });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Delete failed: ' + err.message });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API root route
app.get('/', (req, res) => {
  res.json({
    message: 'Medical Prescription API Server',
    version: '1.0.0',
    endpoints: {
      auth: ['POST /auth/signup', 'POST /auth/login'],
      files: [
        'POST /upload',
        'GET /files?userId=USER_ID',
        'GET /file/:metaId',
        'PUT /file/:metaId',
        'DELETE /file/:metaId',
      ],
      health: 'GET /health',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
