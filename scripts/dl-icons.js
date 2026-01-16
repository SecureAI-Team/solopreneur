const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(process.cwd(), 'apps/miniprogram/miniprogram/images');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const icons = [
    { name: 'home.png', text: 'Home', bg: 'ffffff', color: '999999' },
    { name: 'home-active.png', text: 'Home', bg: 'ffffff', color: '7c3aed' },
    { name: 'content.png', text: 'Doc', bg: 'ffffff', color: '999999' },
    { name: 'content-active.png', text: 'Doc', bg: 'ffffff', color: '7c3aed' },
    { name: 'analytics.png', text: 'Data', bg: 'ffffff', color: '999999' },
    { name: 'analytics-active.png', text: 'Data', bg: 'ffffff', color: '7c3aed' },
    { name: 'profile.png', text: 'User', bg: 'ffffff', color: '999999' },
    { name: 'profile-active.png', text: 'User', bg: 'ffffff', color: '7c3aed' }
];

const download = (filename, text, bg, color) => {
    // using ui-avatars for reliable, small png icons
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=${bg}&color=${color}&size=64&font-size=0.33&length=4&format=png`;

    const file = fs.createWriteStream(path.join(targetDir, filename));

    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close();
            console.log(`Downloaded ${filename}`);
        });
    }).on('error', function (err) {
        fs.unlink(path.join(targetDir, filename));
        console.error(`Error downloading ${filename}: ${err.message}`);
    });
};

icons.forEach(icon => {
    download(icon.name, icon.text, icon.bg, icon.color);
});
