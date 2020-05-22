const path = require('path');
const fs = require('fs');
const express = require('express');
const sharp = require('sharp');

const app = express();

app.param('image', (req, res, next, image) => {
    if(!image.match(/\.(png|jpg|jpeg)$/i)) {
        return res
        .status(req.method === 'POST' ? 403 : 400)
        .send({ status: 'error', reason: 'unsupported image type' });
    }
    req.image = image;
    req.localImagePath = path.join(__dirname, 'uploads', req.image);

    return next();
});

app.param('width', (req, res, next, width) => {
    req.width = +width;
    return next();
});

app.param('height', (req, res, next, height) => {
    req.height = +height;
    return next();
});

function downloadImage(req, res) {
    fs.access(req.localImagePath, fs.constants.R_OK, (err) => {
        if (err) return res.status(404).end();

        let image = sharp(req.localImagePath);
        if(req.width && req.height) {
            image.resize(req.width, req.height, { fit: 'fill' })
        }
        if(req.width || req.height) {
            image.resize(req.width, req.height);
        }

        res.setHeader('Content-Type', 'image/' + path.extname(req.image).substr(1));
        image.pipe(res);
    });
};

app.head('/uploads/:image', (req, res) => {
    fs.access(req.localImagePath, fs.constants.R_OK, (err) => {
        res.status(err ? 404 : 200).end();
    });
});

app.post('/uploads/:image', express.raw({
    limit: '10mb',
    type: 'image/*'
}), (req, res) => {
    let fileData = fs.createWriteStream(req.localImagePath, { flags: 'w+', encoding: 'binary' });

    fileData.write(req.body);
    fileData.end();
    fileData.on('close', () => {
        res.send({ status: 'ok', size: req.body.length });
    });
});

app.get(/\/thumbnail\.(jpg|png)/, (req, res, next) => {
    let format = (req.params[0] === 'png' ? 'png' : 'jpeg');

    let width = 300;
    let height = 200;
    let border = 5;
    let bgcolor = '#fcfcfc';
    let fgcolor = '#ddd';
    let textcolor = '#aaa';
    let textsize = 24;

    let image = sharp({
        create: {
            width: width,
            height: height,
            channels: 4,
            background: { r: 0, g: 0, b: 0 }
        }
    });

    const thumbnail = Buffer.from(
        `<svg width="${width}" height="${height}">
            <rect
                x="0" y="0"
                width="${width}" height="${height}"
                fill="${fgcolor}" 
            />
            <rect
                x="${border}" y="${border}"
                width="${width - border * 2}" height="${height - border * 2}"
                fill="${bgcolor}" 
            />
            <line
                x1="${border * 2}" y1="${border * 2}"
                x2="${width - border * 2}" y2="${height - border * 2}"
                stroke-width="${border}" stroke="${fgcolor}" 
            />
            <line
                x1="${width - border * 2}" y1="${border * 2}"
                x2="${border * 2}" y2="${height - border * 2}"
                stroke-width="${border}" stroke="${fgcolor}" 
            />
            <rect
                x="${border}" y="${(height - textsize) / 2}"
                width="${width - border * 2}" height="${textsize}"
                fill="${bgcolor}" 
            />
            <text
                x="${width / 2}" y="${height / 2}" dy="8"
                font-family="Helvetica" font-size="${textsize}"
                fill="${textcolor}" text-anchor="middle"
                >
                ${width} x ${height}
            </text>
        </svg>`
    );

    image.composite([{ input: thumbnail }]).toFormat(format).pipe(res);
});

app.get('/uploads/:width(\\d+)x:height(\\d+)-:image', downloadImage);
app.get('/uploads/_x:height(\\d+)-:image', downloadImage);
app.get('/uploads/:width(\\d+)x_-:image', downloadImage);
app.get('/uploads/:image',downloadImage);

app.listen(3000, () => {
    console.log('******server is up********');
});
