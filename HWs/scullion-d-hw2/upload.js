const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const mime = require('mime');
const path = require('path');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

app.use(cors());
app.use(fileUpload());
app.use('/uploads', express.static(uploadsDir), (req, res, next) => {
    let filePath = path.join(uploadsDir, req.url);
    let mimeType = mime.getType(filePath);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Create uploads directory if it does not exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded');
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.file;
    let fileName = file.name;
    let fileDestination = 'uploads/' + fileName;

    file.mv(fileDestination, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        fs.chmod(fileDestination, 0o644, err => {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            }

            let fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
            console.log(`File uploaded: ${fileUrl}`);
            res.send(fileDestination);
        });
    });
});

app.listen(process.env.PORT, () => {
    console.log('Server started on Render');
});
