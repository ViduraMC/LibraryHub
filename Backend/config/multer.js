import multer from "multer";
import path from "path";

// store CSV files in memory (we parse and save to DB, no need to keep file)
const storage = multer.memoryStorage();

// only allow CSV files
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".csv") {
        cb(null, true);
    } else {
        cb(new Error("Only CSV files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

export default upload;
