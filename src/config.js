const fs = require('fs');
const path = require('path');

// Function to load saved addon settings from settings file
function getSavedAddonSettings() {
    try {
        const settingsPath = path.join(__dirname, '..', 'addon-settings.json');
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            return {
                addonName: settings.addonName || 'AI Media TV',
                addonDescription: settings.addonDescription || 'Modalita provvisoria, installazione con errori, attivo mod. provvisoria',
                addonLogo: settings.addonLogo || 'https://github.com/mccoy88f/OMG-TV-Stremio-Addon/blob/main/tv.png?raw=true'
            };
        }
    } catch (error) {
        console.error('Error loading addon settings:', error);
    }
    return {
        addonName: process.env.ADDON_NAME || 'AI Media TV',
        addonDescription: process.env.ADDON_DESCRIPTION || 'Modalita provvisoria, installazione con errori, attivo mod. provvisoria',
        addonLogo: process.env.ADDON_LOGO || 'https://github.com/mccoy88f/OMG-TV-Stremio-Addon/blob/main/tv.png?raw=true'
    };
}

const baseConfig = {
    port: process.env.PORT || 10000,
    defaultUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    defaultLanguage: 'Italiana',
    cacheSettings: {
        updateInterval: 2 * 60 * 60 * 1000,
        maxAge: 12 * 60 * 60 * 1000,
        retryAttempts: 3,
        retryDelay: 5000
    },
    epgSettings: {
        maxProgramsPerChannel: 50,
        updateInterval: 2 * 60 * 60 * 1000,
        cacheExpiry: 12 * 60 * 60 * 1000
    },
    manifest: {
        id: 'org.mccoy88f.omgtv',
        version: '7.0.0',
        name: getSavedAddonSettings().addonName,
        description: getSavedAddonSettings().addonDescription,
        logo: getSavedAddonSettings().addonLogo,
        resources: ['stream', 'catalog', 'meta'],
        types: ['tv'],
        idPrefixes: ['tv'],
        catalogs: [
            {
                type: 'tv',
                id: 'omg_tv',
                name: getSavedAddonSettings().addonName,
                extra: [
                    {
                        name: 'genre',
                        isRequired: false,
                        options: []
                    },
                    {
                        name: 'search',
                        isRequired: false
                    },
                    {
                        name: 'skip',
                        isRequired: false
                    }
                ]
            }
        ],
        behaviorHints: {
            configurationURL: null,
            reloadRequired: true
        }
    }
};

function loadCustomConfig() {
    const configOverridePath = path.join(__dirname, '..', 'addon-config.json');
    const savedSettings = getSavedAddonSettings();
    
    try {
        const addonConfigExists = fs.existsSync(configOverridePath);

        if (addonConfigExists) {
            const customConfig = JSON.parse(fs.readFileSync(configOverridePath, 'utf8'));
            
            const mergedConfig = {
                ...baseConfig,
                defaultLanguage: customConfig.defaultLanguage || baseConfig.defaultLanguage,
                manifest: {
                    ...baseConfig.manifest,
                    id: customConfig.addonId || baseConfig.manifest.id,
                    name: customConfig.addonName || savedSettings.addonName,
                    description: customConfig.addonDescription || savedSettings.addonDescription,
                    version: customConfig.addonVersion || baseConfig.manifest.version,
                    logo: customConfig.addonLogo || savedSettings.addonLogo,
                    behaviorHints: {
                        configurationURL: null,
                        reloadRequired: true
                    },
                    catalogs: [{
                        ...baseConfig.manifest.catalogs[0],
                        id: addonConfigExists ? 'omg_plus_tv' : baseConfig.manifest.catalogs[0].id,
                        name: customConfig.addonName || savedSettings.addonName,
                        extra: [
                            {
                                name: 'genre',
                                isRequired: false,
                                options: []
                            },
                            {
                                name: 'search',
                                isRequired: false
                            },
                            {
                                name: 'skip',
                                isRequired: false
                            }
                        ]
                    }]
                }
            };

            return mergedConfig;
        }
    } catch (error) {
        console.error('Error loading custom configuration:', error);
    }

    return baseConfig;
}

const config = loadCustomConfig();
module.exports = config;