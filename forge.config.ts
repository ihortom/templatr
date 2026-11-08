import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import { productName, version, author } from './package.json';


const appName = productName;
const appVersion = version;
const appCopyright = `Copyright © ${new Date().getFullYear()} ${author}`;

const config: ForgeConfig = {
    packagerConfig: {
        name: `${appName}`,
        appVersion: `${appVersion}`,
        appCopyright: `${appCopyright}`,
        appCategoryType: 'public.app-category.productivity',
        asar: true,
        icon: './assets/templatr.icns',
    },
    rebuildConfig: {},
    hooks: {
        // Flipping fuses (and stitching a universal binary) invalidates code
        // signatures, and Apple Silicon refuses to run unsigned code. There is
        // no osxSign config (no Developer ID), so ad-hoc sign the final app.
        postPackage: async (_config, { platform, outputPaths }) => {
            if (platform !== 'darwin') return;
            for (const outputPath of outputPaths) {
                for (const entry of fs.readdirSync(outputPath)) {
                    if (entry.endsWith('.app')) {
                        execFileSync('codesign', ['--force', '--deep', '--sign', '-', path.join(outputPath, entry)], { stdio: 'inherit' });
                    }
                }
            }
        },
        // out/make keeps DMGs from earlier runs (other archs and versions),
        // so list exactly what this run produced.
        postMake: async (_config, makeResults) => {
            console.log('\nBuilt in this run:');
            for (const { arch, artifacts } of makeResults) {
                for (const artifact of artifacts) {
                    console.log(`  [${arch}] ${path.relative(process.cwd(), artifact)}`);
                }
            }
            return makeResults;
        },
    },
    makers: [ 
        // Config is resolved per target arch so that x64, arm64 and universal
        // builds produce distinct DMG names instead of overwriting each other.
        new MakerDMG((arch) => ({
            name: `${appName}_v${appVersion}_${arch}`,
            icon: './assets/templatr.icns',
            background: './assets/installer.png',
            overwrite: true
        }))
    ],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            mainConfig,
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.tsx',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                    {
                        html: './src/about.html',
                        js: './src/renderer-about.tsx',
                        name: 'about_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                ],
            },
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            // Forge would ad-hoc re-sign arm64 builds here, which leaves the
            // arm64 and x64 slices with different files and breaks universal
            // builds. Signing is done once on the final app in postPackage.
            resetAdHocDarwinSignature: false,
            [FuseV1Options.RunAsNode]: false,
            // The app stores nothing in cookies / safeStorage, so cookie
            // encryption is disabled to avoid the macOS keychain ("Safe
            // Storage") access prompt on launch for this unsigned build.
            [FuseV1Options.EnableCookieEncryption]: false,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};

export default config;
