function apiKeyManagementSidebar() {
  universalSidebar('API key management', 'bTranslate: API keys, LLM settings');
}

function universalSidebar(htmlFile, title) {
  const htmlTemplate = HtmlService.createTemplateFromFile(htmlFile);
  const htmlOutput = htmlTemplate.evaluate();
  DocumentApp.getUi().showSidebar(htmlOutput.setTitle(title));
}

function setDefaultAiModels(theyUseLegacySettings) {
  const arrayTranslators = {
    OpenAI: [DEFAULT_OPENAI_MODEL],
    Anthropic: [DEFAULT_ANTHROPIC_MODEL]
  }
  if (theyUseLegacySettings === true) {
    arrayTranslators.OpenAI.unshift(LEGACY_OPENAI_MODEL);
  }
  setAiModels(arrayTranslators);
  return JSON.stringify(arrayTranslators);
}

function setAiModels(arrayTranslators) {
  const properties = PropertiesService.getUserProperties();
  properties.setProperty('AI_MODELS', JSON.stringify(arrayTranslators));
}

function getAiModels() {
  const properties = PropertiesService.getUserProperties();
  let arrayTranslators = properties.getProperty('AI_MODELS');

  if (arrayTranslators == null) {
    let theyUseLegacySettings = false;
    const translationSettings = getTranslationSettings();
    for (let code in translationSettings) {
      if (code !== 'menuOrder') {
        const source = translationSettings[code].source;
        const keys = Object.keys(source);
        // 'openAI' key means they use legacy settings
        if (keys.includes(LEGACY_OPENAI_MODEL.name)) {
          theyUseLegacySettings = true;
          break;
        }
      }
    }
    arrayTranslators = setDefaultAiModels(theyUseLegacySettings);
  }
  //Logger.log(arrayTranslators);
  return arrayTranslators;
}

function deleteAiModelsSettings() {
  PropertiesService.getUserProperties().deleteProperty('AI_MODELS');
}

function saveApiKey(provider, storage, apiKey) {
  return enterAPIkey(provider, storage, apiKey);
}

function updateApiKey(provider, storage, apiKey) {
  return enterAPIkey(provider, storage, apiKey);
}

function removeApiKey(provider, storage) {
  const propertyName = PROPERTY_NAMES[provider]['propertyApiKeyName'];
  if (storage == 'user') {
    properties = PropertiesService.getUserProperties();
  } else {
    properties = PropertiesService.getDocumentProperties();
  }
  properties.deleteProperty(propertyName);
  return { status: 'ok' };
}


function allInfoAboutProvider(provider = 'DeepL') {
  const propertyApiKeyName = PROPERTY_NAMES[provider]['propertyApiKeyName'];
  const storage = getDeeplApiKeySettings(true, provider).settings;
  const apiKeyUser = getDeepLAPIkey('user', propertyApiKeyName);
  const apiKeyDoc = getDeepLAPIkey('doc', propertyApiKeyName);
  return { storage: storage, apiKeyUser: apiKeyUser, apiKeyDoc: apiKeyDoc };
}

function allProviders() {
  const allProviders = {
    Anthropic: {
      user: {
        added: false,
        works: false,
        default: false
      },
      doc: {
        added: false,
        works: false,
        default: false
      },
      tr: true
    },
    DeepL: {
      user: {
        added: false,
        works: false,
        default: false
      },
      doc: {
        added: false,
        works: false,
        default: false
      },
      tr: false
    },
    OpenAI: {
      user: {
        added: false,
        works: false,
        default: false
      },
      doc: {
        added: false,
        works: false,
        default: false
      },
      tr: true
    }
  };

  for (let provider in allProviders) {
    const { storage, apiKeyUser, apiKeyDoc } = allInfoAboutProvider(provider);
    if (storage === 'user') {
      allProviders[provider].user.default = true;
      allProviders[provider].doc.default = false;
    } else if (storage === 'doc') {
      allProviders[provider].user.default = false;
      allProviders[provider].doc.default = true;
    } else {
      allProviders[provider].user.default = false;
      allProviders[provider].doc.default = false;
    }
    if (apiKeyUser) {
      allProviders[provider].user.added = true;
      const testResult = PROPERTY_NAMES[provider]['testKey'](apiKeyUser);
      if (testResult.status === 'ok') {
        allProviders[provider].user.works = true;
      }
    }
    if (apiKeyDoc) {
      allProviders[provider].doc.added = true;
      const testResult = PROPERTY_NAMES[provider]['testKey'](apiKeyDoc);
      if (testResult.status === 'ok') {
        allProviders[provider].doc.works = true;
      }
    }
  }
  return JSON.stringify(allProviders);
}

const settings = {
  Anthropic: {
    arrayAllModels: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
    maxTokens: { min: 0, max: 4000, step: 1 },
    maxTokensForModel: [4000, 4000, 4000, 4000],
    temperature: { min: 0, max: 1, step: 0.1 },
    useDefaultPrompt: true,
    defaultPrompt: 'Translate from <S> to <T>. Return only translation.'
  },
  OpenAI: {
    arrayAllModels: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-3.5-turbo-16k"],
    maxTokens: { min: 0, max: 4036, step: 1 },
    maxTokensForModel: [4095, 4095, 4095, 16384],
    temperature: { min: 0, max: 2, step: 0.01 },
    useDefaultPrompt: true,
    defaultPrompt: 'Translate from <S> to <T>. Return only translation.'
  }
};


function getTranslators(provider) {
  const arrayTranslators = JSON.parse(getAiModels());

  return { arrayTranslators: arrayTranslators[provider], settings: settings[provider] };
}

function extractTranslatorNames() {
  const data = JSON.parse(getAiModels());
  return JSON.stringify(extractTranslatorNamesHelper(data));
}

function extractTranslatorNamesHelper(data) {
  const modelNames = ['OpenAI', 'DeepL', 'Google', LEGACY_OPENAI];

  // Loop through each key in the object (e.g., "OpenAI", "Anthropic")
  Object.keys(data).forEach((key) => {
    // For each key, access its array and then further iterate over each item
    data[key].forEach((item) => {
      // Push the 'name' property of each item to the modelNames array
      modelNames.push(item.name);
    });
  });
  //Logger.log(modelNames);
  return modelNames;
}

function extractTranslatorNamesLLM() {
  const data = JSON.parse(getAiModels());
  return extractTranslatorNamesHelperLLM(data);
}

function forJsExtractTranslatorNamesLLM() {
  const translators = extractTranslatorNamesLLM();
  delete translators.allModelsByNames;
  return JSON.stringify(translators);
}

function extractTranslatorNamesHelperLLM(data) {
  const modelNames = {
    Anthropic: [],
    OpenAI: [],
    allModelsByNames: new Object()
  };

  // Loop through each key in the object (e.g., "OpenAI", "Anthropic")
  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      // Push the 'name' property of each item to the modelNames array
      modelNames[key].push(item.name);
      let clonedObject = { ...item };
      const newNameKey = clonedObject.name;
      let newObject = {};
      newObject[newNameKey] = clonedObject;
      modelNames.allModelsByNames[newNameKey] = clonedObject;
    });
  });
  return modelNames;
}


function saveTranslator(provider, translator, toDoSave) {
  if (!translator || typeof translator !== 'object') {
    throw new Error('Invalid translator object provided.');
  }
  const { model, temperature, maxTokens, customPrompt, name, useDefaultPrompt } = translator;

  const arrayTranslators = JSON.parse(getAiModels());
  const translators1dArray = extractTranslatorNamesHelper(arrayTranslators);
  if (toDoSave === true) {
    if (translators1dArray.includes(name)) {
      throw new Error('Name ' + name + ' already exists.');
    }
    arrayTranslators[provider].push({
      model: model,
      temperature: temperature,
      maxTokens: maxTokens,
      customPrompt: customPrompt,
      name: name,
      useDefaultPrompt: useDefaultPrompt
    });
  } else {
    if (!arrayTranslators[provider]) {
      throw new Error('Unknown provider.');
    }
    const index = arrayTranslators[provider].findIndex(item => item.name === name);
    arrayTranslators[provider][index] = translator;
  }
  setAiModels(arrayTranslators);
  const translatorNames = extractTranslatorNamesHelper(arrayTranslators);
  return { status: 'ok', arrayTranslators: arrayTranslators[provider], settings: settings[provider], translatorNames: translatorNames };
}

function delTranslator(provider, index, translatorName) {
  let menuOrderIndex;
  const arrayTranslators = JSON.parse(getAiModels());
  if (arrayTranslators[provider][index].name === translatorName) {
    arrayTranslators[provider].splice(index, 1);

    const allTranslationSettings = getTranslationSettings();
    //Logger.log(allTranslationSettings);
    for (let code in allTranslationSettings) {
      if (code !== 'menuOrder') {
        //Logger.log(code + ' ' + JSON.stringify(allTranslationSettings[code]));
        // Sources
        const source = allTranslationSettings[code].source;
        const keys = Object.keys(source);
        if (keys.length === 1 && keys[0] === translatorName) {
          //return { status: 'delFullSet' };
          delete allTranslationSettings[code];
          menuOrderIndex = allTranslationSettings.menuOrder.indexOf(code);
          if (menuOrderIndex > -1) {
            allTranslationSettings.menuOrder.splice(menuOrderIndex, 1);
          }
          continue;
        }
        if (keys.includes(translatorName)) {
          delete allTranslationSettings[code].source[translatorName];
        }
        // End. Sources

        // Targets
        const targets = allTranslationSettings[code].targets;
        for (let i = 0; i < targets.length; i++) {
          if (targets[i].hasOwnProperty(translatorName)) {
            targets.splice(i, 1);
            i--;
            //break;
          }
        }
        if (targets.length === 0) {
          delete allTranslationSettings[code];
          menuOrderIndex = allTranslationSettings.menuOrder.indexOf(code);
          if (menuOrderIndex > -1) {
            allTranslationSettings.menuOrder.splice(menuOrderIndex, 1);
          }
        }
        // End. Targets
      }
    }
    //Logger.log(allTranslationSettings);
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('TRANSLATION_SETTINGS', JSON.stringify(allTranslationSettings));
  } else {
    return { status: 'error', message: 'The translator wasn\'t deleted. Close the sidebar and open it again, then delete.' };
  }
  setAiModels(arrayTranslators);
  const translatorNames = extractTranslatorNamesHelper(arrayTranslators);
  onOpen();
  return { status: 'ok', arrayTranslators: arrayTranslators[provider], settings: settings[provider], translatorNames: translatorNames };
}