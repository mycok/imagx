const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

function downloadImage(req, res) {
    fs.access(req.localImagePath, fs.constants.R_OK, (err) => {
        if (err) return res.status(404).end();

        let image = sharp(req.localImagePath);
        if(req?.width && req?.height) {
            image.resize(req.width, req.height, { fit: 'fill' })
        }

        if(req?.width || req?.height) {
            image.resize(req.width, req.height);
        }
        
        if (req.greyscale){
            image.greyscale();
        }

        res.setHeader('Content-Type', 'image/' + path.extname(req.image).substr(1));
        image.pipe(res);
    });
};

module.exports = { downloadImage };
