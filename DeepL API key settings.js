const PROPERTY_NAMES = {
  DEEPL: {
    propertyApiKeySettingsName: 'DEEPL_API_KEY_SETTINGS',
    propertyApiKeyName: 'DeepLAPIkey',
    textName: 'DeepL'
  },
  CHATGPT: {
    propertyApiKeySettingsName: 'CHATGPT_API_KEY_SETTINGS',
    propertyApiKeyName: 'ChatGPTAPIkey',
    textName: 'ChatGPT'
  }
};

// submenu_09_translate_basic, translateSelectionAndAppendL use the function
function getDeeplApiKeySettings(tryToRetrieveProperties, translator) {
  const DEFAULT_SETTINGS = 'user';
  const resultObj = {
    marker: '',
    settings: DEFAULT_SETTINGS,
    menuText: deeplApiKeySettings[DEFAULT_SETTINGS]['menuText']
  };
  if (tryToRetrieveProperties === true) {
    try {
      const userProperties = PropertiesService.getUserProperties();
      const settings = userProperties.getProperty(PROPERTY_NAMES[translator]['propertyApiKeySettingsName']);
      if (settings != null && deeplApiKeySettings.hasOwnProperty(settings)) {
        resultObj['settings'] = settings;
        resultObj['menuText'] = translator === 'DEEPL' ? deeplApiKeySettings[settings]['menuText'] : chatGPTApiKeySettings[settings]['menuText'];
        resultObj['marker'] = '✅';
        if (settings == 'doc') {
          const docKey = getDeepLAPIkey('doc', PROPERTY_NAMES[translator]['propertyApiKeyName']);
          if (docKey == null) {
            resultObj['marker'] = '❌';
          }
        }
      }
      if (settings == null) {
        resultObj['marker'] = '✅';
      }
    }
    catch (error) {
      Logger.log('Needs to activate!!! ' + error);
    }
  }
  return resultObj;
}


function activateDeeplApiKeySettings(obj, translatorName) {
  const apiKeySettingsObj = translatorName === 'DEEPL' ? deeplApiKeySettings : chatGPTApiKeySettings;
  // Finds key in apiKeySettingsObj where value equals obj
  const settings = Object.keys(apiKeySettingsObj).find(key => apiKeySettingsObj[key] === obj);
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty(translatorName + '_API_KEY_SETTINGS', settings);
  onOpen();
}

// Menu items of DeepL API key settings
const deeplApiKeySettings = {
  "user": {
    "menuText": "Default to user DeepL API key",
    "run": function () { activateDeeplApiKeySettings(this, 'DEEPL'); }
  },
  "doc": {
    "menuText": "Default to document DeepL API key",
    "run": function () { activateDeeplApiKeySettings(this, 'DEEPL'); }
  },
  "ask": {
    "menuText": "Always ask",
    "run": function () { activateDeeplApiKeySettings(this, 'DEEPL'); }
  }
}

// Menu items of ChatGPT API key settings
const chatGPTApiKeySettings = {
  "user": {
    "menuText": "Default to user ChatGPT API key",
    "run": function () { activateDeeplApiKeySettings(this, 'CHATGPT'); }
  },
  "doc": {
    "menuText": "Default to document ChatGPT API key",
    "run": function () { activateDeeplApiKeySettings(this, 'CHATGPT'); }
  },
  "ask": {
    "menuText": "Always ask",
    "run": function () { activateDeeplApiKeySettings(this, 'CHATGPT'); }
  }
}
