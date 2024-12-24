import multer from 'multer'


export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({ message: 'Ukuran file melebihi ukuran maksimum yang diizinkan (5MB)' });
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({ message: 'Terlalu banyak file. Hanya satu file yang diperbolehkan' });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({ message: 'File yang tidak diharapkan. Silakan unggah file yang valid.' });
        default:
          return res.status(400).json({ message: `Multer error: ${err.message}` });
      }
    }
  
    if (err) {
      // Tangani error umum lainnya
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'An internal server error occurred.', error: err.message });
    }
  
    // Jika tidak ada error, lanjutkan ke middleware berikutnya
    next();
  };
  