const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const uploadDir = 'uploads';

app.use(cors());
app.use(fileUpload());

// Create uploads directory if it does not exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
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
        res.send(fileDestination);
    });
});

app.listen(process.env.PORT, () => {
    console.log('Server started on Render');
});
