const fs = require('fs');
const crypto = require('crypto');

function save(data) {
    let obj = {}
    for (let key in data) {
        if (key !== 'settings') {
            obj[key] = data[key];
        }
    }
    // Save it
    fs.writeFileSync('local.storage', JSON.stringify(obj))
}

function load() {
    if (fs.existsSync('local.storage')) {
        return JSON.parse(fs.readFileSync('local.storage'))
    } else {
        return {}
    }
}

module.exports = {
    save: save, 
    load: load
}