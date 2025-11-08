const fs = require('fs');

const handler = async (m, { kiicode, command, prefix, text }) => {
    if (!text) {
        return m.reply(
            `Penggunaan tidak valid.\n\n` +
            `Contoh:\n` +
            `${prefix + command} Halo Dunia\n` +
            `${prefix + command} Hello World --white --black\n\n` +
            `Format: ${prefix + command} <teks> [--background] [--color]\n` +
            `Warna diketik di akhir dengan awalan '--'`
        );
    }

    if (text.length > 300) {
        return m.reply(`Teks tidak boleh lebih dari 300 karakter.`);
    }

    m.reply(`Sedang memproses, tunggu sebentar...`);

    try {
        const args = text.trim().split(/\s+/);
        const colorArgs = args.filter(arg => arg.startsWith('--')).map(arg => arg.replace('--', ''));
        const mainText = args.filter(arg => !arg.startsWith('--')).join(' ');

        const background = colorArgs[0] || 'white';
        const color = colorArgs[1] || 'black';

        const url = `https://www.itzky.xyz/api/maker/brat?text=${encodeURIComponent(mainText)}&background=${encodeURIComponent(background)}&color=${encodeURIComponent(color)}`;

        const buffer = await getBuffer(url);
        const fileName = `stickerImage_${m.sender}.png`;
        const filePath = await saveImageToFile(buffer, fileName);

        kiicode.sendImageAsSticker(m.chat, fs.readFileSync(filePath), m, {
            packname: global.packname,
            author: global.ownername,
        });
    } catch (err) {
        console.error(err);
        return m.reply("Gagal memproses gambar. Silakan coba lagi.");
    }
};

handler.command = /^brat$/i;
handler.tags = ["sticker"];

module.exports = handler;