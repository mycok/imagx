const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

function downloadImage(req, res) {
    fs.access(req.localImagePath, fs.constants.R_OK, (err) => {
        if (err) return res.status(404).end();

        const image = sharp(req.localImagePath);
        const queryBooleans = ['y', 'yes', '1', 'on'];
        const width = +req?.query?.width;
        const height = +req?.query?.height;
        const blur = +req.query?.blur;
        const sharpen = +req.query?.sharpen;
        const greyscale = (queryBooleans.includes(req?.query?.greyscale));
        const flip = (queryBooleans.includes(req?.query?.flip));
        const flop = (queryBooleans.includes(req?.query?.flop));

        if (width > 0 && height > 0) {
            image.resize(req.width, req.height, { fit: 'fill' });
        };

        if (width > 0 || height > 0) {
            image.resize(width || null, height || null);
        }
        
        if (greyscale){
            image.greyscale();
        }

        if (blur > 0) {
            image.blur(blur);
        }

        if (sharp > 0) {
            image.sharpen(sharpen);
        }

        if (flip) image.flip();
        if (flop) image.flop();

        res.setHeader('Content-Type', `image/${path.extname(req.image).substr(1)}`);
        image.pipe(res);
    });
};

module.exports = { downloadImage };
