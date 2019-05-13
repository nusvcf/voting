const fs = require("fs");
const crypto = require("crypto");

function getCipherKey(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest();
}

const iv = crypto.randomBytes(16);

function encrypt(text, pw) {
    let key = crypto.createHash('sha256').update(String(pw)).digest('base64').substr(0, 32);
    let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

function decrypt(text, pw) {
    let iv = Buffer.from(text.iv, "hex");
    let key = crypto.createHash('sha256').update(String(pw)).digest('base64').substr(0, 32);
    let encryptedText = Buffer.from(text.encryptedData, "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function save(data) {
    let obj = {};
    for (let key in data) {
        if (key !== "settings") {
            obj[key] = data[key];
        }
    }
    // Save it
    fs.writeFileSync(
        "local.storage",
        JSON.stringify(encrypt(JSON.stringify(obj), data.adminPw))
    );
}

function load(pw) {
    if (fs.existsSync("local.storage")) {
        let data = JSON.parse(decrypt(JSON.parse(fs.readFileSync("local.storage")), pw));
        return data;
    } else {
        return {};
    }
}

module.exports = {
    save: save,
    load: load
};
