import { contextBridge, ipcRenderer } from 'electron';


// Expose protected methods that allow renderer using them
declare global {
    interface Window {
        electron: any;
    }
}

const getExternalData = (channel: string) => {
    return ipcRenderer.sendSync(channel);
}

// Expose the ipcRenderer
contextBridge.exposeInMainWorld('electron', {

    pasteFromClipboard: (element: HTMLInputElement) => {
        element.value = getExternalData('getClipboard');
    },
    getTemplates: (): object => {
        return getExternalData('getTemplates');
    },
    getSubstitutes: (): string[]|string => {
        return getExternalData('getSubstitutes');
    },
    getComments: (): object => {
        return getExternalData('getComments');
    },
    showContextMenu: () => {
        ipcRenderer.send('show-context-menu');
    },
});
  
ipcRenderer.on('context-menu-command', (event, command) => {
    if (command === 'copy') {
        const getSelectedText = () => window.getSelection().toString();
        ipcRenderer.send('setClipboard', getSelectedText());
    }
});