const { clipboard, contextBridge } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const YAML = require('yaml');

contextBridge.exposeInMainWorld('electron', {
    getTemplateSync: () => {
        const pathToTemplates = path.join(os.homedir(), '.templatr', 'template.yaml');
        if (fs.existsSync(pathToTemplates)) {
            try {
                const file = fs.readFileSync(pathToTemplates, 'utf8');
                if (file.length > 0) {
                    const data = YAML.parse(file);
                    return data;
                }
                else {
                    return {};
                }
            }
            catch(err) {
                return {error: err.message};
            }
        }
        else {  // create empty file
            try {
                const appDir = path.join(os.homedir(), '.templatr')
                if (!fs.existsSync(appDir)){
                    fs.mkdirSync(appDir);
                }
                fs.writeFileSync(pathToTemplates, '', {flag: 'w', encoding: 'utf-8'});
            }
            catch(err) {
                return {error: "Could not create templates file"};
            }
            return {};
        }
    },
    getSubstitutesSync: () => {
        const pathToSubstitutes = path.join(os.homedir(), '.templatr', 'substitutes.yaml');
        if (fs.existsSync(pathToSubstitutes)) {
            try {
                const file = fs.readFileSync(pathToSubstitutes, 'utf8');
                if (file.length > 0) {
                    const data = YAML.parse(file);
                    return data;
                }
                else {
                    return {};
                }
            }
            catch(err) {
                return {error: err.message};
            }
        }
        else {  // create empty file
            try {
                const appDir = path.join(os.homedir(), '.templatr')
                if (!fs.existsSync(appDir)){
                    fs.mkdirSync(appDir);
                }
                fs.writeFileSync(pathToSubstitutes, '', {flag: 'w', encoding: 'utf-8'});
            }
            catch(err) {
                return {error: "Could not create variable substututes file"};
            }
            return {};
        }
    },
    getComments: () => {
        const pathToTemplates = path.join(os.homedir(), '.templatr', 'template.yaml');
        try {
            const file = fs.readFileSync(pathToTemplates, 'utf8');
            if (file.length > 0) {
                let matches = file.matchAll(/-(.*)#(.*)/g);
                let comments = [...matches].map(m => new Object({[m[1].trim().replaceAll('"', '')]: m[2].trim()}));
                
                let data = {};
                comments.forEach(i => data[Object.keys(i)[0]] = Object.values(i)[0]);
                return data;
            }
            else {
                return {};
            }
        }
        catch(err) {
            return {};
        }
    },
    pasteFromClipboard: (element) => {
        element.value = clipboard.readText();
    },
    configureExternalLinks: () => {
        const aAll = document.querySelectorAll("a.open-externally");
        if (aAll && aAll.length) {
            aAll.forEach(function(a) {
                a.addEventListener("click", function(event) {
                    if (event.target) {
                        event.preventDefault();
                        let link = event.target.href;
                        require("electron").shell.openExternal(link);
                    }
                });
            });
        }
    }
})
