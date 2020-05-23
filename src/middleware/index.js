const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

function downloadImage(req, res) {
    fs.access(req.localImagePath, fs.constants.R_OK, (err) => {
        if (err) return res.status(404).end();

        const image = sharp(req.localImagePath);
        const width = +req?.query?.width;
        const height = +req?.query?.height;
        const greyscale = (['y', 'yes', '1'].includes(req?.query?.greyscale));

        if (width > 0 && height > 0) {
            image.resize(req.width, req.height, { fit: 'fill' });
        };

        if (width > 0 || height > 0) {
            image.resize(width || null, height || null);
        }
        
        if (greyscale){
            image.greyscale();
        }

        res.setHeader('Content-Type', `image/${path.extname(req.image).substr(1)}`);
        image.pipe(res);
    });
};

module.exports = { downloadImage };
