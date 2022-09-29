/* function getDeeplApiKeySettings() {
  const userProperties = PropertiesService.getUserProperties();
  const settings = userProperties.getProperty('DEEPL_API_KEY_SETTINGS');
  return settings;
} */


function getDeeplApiKeySettings() {
  const DEFAULT_SETTINGS = 'user';
  let resultObj = {
    marker: '',
    settings: DEFAULT_SETTINGS,
    menuText: deeplApiKeySettings[DEFAULT_SETTINGS]['menuText']
  };
  try {
    const userProperties = PropertiesService.getUserProperties();
    const settings = userProperties.getProperty('DEEPL_API_KEY_SETTINGS');
    if (settings != null && deeplApiKeySettings.hasOwnProperty(settings)) {
      resultObj['settings'] = settings;
      resultObj['menuText'] = deeplApiKeySettings[settings]['menuText'];
      resultObj['marker'] = '✅';
      if (settings == 'doc') {
        const docKey = getDeepLAPIkey('doc')
        if (docKey == null) {
          resultObj['marker'] = '❌';
        }
      }
    }

  }
  catch (error) {
    Logger.log('Needs to activate!!! ' + error);
  }
  Logger.log(resultObj);
  return resultObj;
}


function activateDeeplApiKeySettings(obj) {
  // Finds key in deeplApiKeySettings where value equals obj
  const settings = Object.keys(deeplApiKeySettings).find(key => deeplApiKeySettings[key] === obj);
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('DEEPL_API_KEY_SETTINGS', settings);
  onOpen();
}

// Menu items of DeepL API key settings
const deeplApiKeySettings = {
  "user": {
    "menuText": "Default to user API key",
    "run": function () { activateDeeplApiKeySettings(this); }
  },
  "doc": {
    "menuText": "Default to document API key",
    "run": function () { activateDeeplApiKeySettings(this); }
  },
  "ask": {
    "menuText": "Always ask",
    "run": function () { activateDeeplApiKeySettings(this); }
  }
}
