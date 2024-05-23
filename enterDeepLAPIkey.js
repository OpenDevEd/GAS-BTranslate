// Menu item 'Add API key for user / all documents'
function enterDeepLAPIkeyUser() {
  enterDeepLAPIkey('user', 'DEEPL');
}

// Menu item 'Add/change API key for document' 
function enterDeepLAPIkeyDoc() {
  enterDeepLAPIkey('doc', 'DEEPL');
}

// Menu item 'Add API key for user / all documents'
function enterChatGPTAPIkeyUser() {
  enterDeepLAPIkey('user', 'CHATGPT');
}

// Menu item 'Add/change API key for document' 
function enterChatGPTAPIkeyDoc() {
  enterDeepLAPIkey('doc', 'CHATGPT');
}

// enterDeepLAPIkeyUser, enterDeepLAPIkeyDoc, translateSelectionAndAppendL use the function
// translatorName: DeepL or ChatGPT
// propertyName: 'DeepLAPIkey' or 'ChatGPTAPIkey'
function enterDeepLAPIkey(storage, translator) {
  const translatorName = PROPERTY_NAMES[translator]['textName'];
  const propertyName = PROPERTY_NAMES[translator]['propertyApiKeyName'];
  let properties;
  const storageDesc = storage == 'user' ? 'user / all documents' : 'document';
  let apiKey = getValueFromUser(translatorName + ' API key', 'Please enter the ' + translatorName + ' API key for ' + storageDesc);
  if (apiKey == null) {
    return { status: 'error' };
  }
  apiKey = apiKey.trim();
  if (apiKey != '') {
    const result = translatorName === 'DeepL' ? testDeeplKey(apiKey) : testChatGPTKey(apiKey);
    if (result.status == 'ok') {
      if (storage == 'user') {
        properties = PropertiesService.getUserProperties();
      } else {
        properties = PropertiesService.getDocumentProperties();
      }
      properties.setProperty(propertyName, apiKey);
      onOpen();
      return { status: 'ok', apiKey: apiKey };
    } else {
      alert(result.message);
    }
  }
  return { status: 'error' };
}

// 2024 sidebar
function enterAPIkey(provider, storage, apiKey) {
  const propertyName = PROPERTY_NAMES[provider]['propertyApiKeyName'];
  let properties;
  apiKey = apiKey.trim();
  if (apiKey != '') {
    const testResult = PROPERTY_NAMES[provider]['testKey'](apiKey);
    if (testResult.status === 'ok') {
      if (storage == 'user') {
        properties = PropertiesService.getUserProperties();
      } else {
        properties = PropertiesService.getDocumentProperties();
      }
      properties.setProperty(propertyName, apiKey);
      return { status: 'ok' };
    } else {
      return { status: 'error', message: `The ${provider} API key doesn't work.` };
    }
  }
  return { status: 'error', message: `Something went wrongt. The ${provider} API key wasn't saved.` };
}

// Checks DeepL API key
// Requests language sources, checks response code
function testDeeplKey(apiKey) {
  try {
    const url = 'https://api.deepl.com/v2/languages?auth_key=' + apiKey + '&type=source';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const responseCode = response.getResponseCode();
    if (responseCode == 200) {
      return { status: 'ok' };
    } else if (responseCode == 403) {
      return { status: 'wrong', message: 'Wrong API key' };
    } else {
      return { status: 'error', message: 'Error in testDeeplKey (1)' };
    }
  }
  catch (error) {
    return { status: 'error', message: 'Error in testDeeplKey (2)' };
  }
}


function testTestChatGPTKey() {
  const apiKey = getDeepLAPIkey('user', 'ChatGPTAPIkey');
  const result = testChatGPTKey(apiKey);
  Logger.log(result);
}

// Checks ChatGPT API key
// Requests models
function testChatGPTKey(apiKey) {
  try {
    const url = 'https://api.openai.com/v1/models';
    const options = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    //Logger.log(json);

    const responseCode = response.getResponseCode();
    if (responseCode == 200) {
      return { status: 'ok' };
    } else {
      const message = json.error?.message ? json.error.message : '';
      if (json.error?.code === 'invalid_api_key') {
        return { status: 'wrong', message: 'Wrong API key. ' + message };
      } else {
        return { status: 'error', message: 'Error in testChatGPTKey (1). ' + message };
      }
    }
  }
  catch (error) {
    return { status: 'error', message: 'Error in testChatGPTKey (2)' + error };
  }
}


function testAnthropicKey(apiKey) {
  try {
    const url = 'https://api.anthropic.com/v1/messages';
    const headers = {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    };
    const payload = {
      "model": "claude-3-haiku-20240307",
      "max_tokens": 1,
      "temperature": 0,
      "messages": [
        { "role": "user", "content": "Do you speak English? Return Y or N." }
      ]
    };

    const options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    if (data.error) {
      throw new Error(`API error: ${data.error.message}`);
    }

    return { status: 'ok' };
  }
  catch (error) {
    return { status: 'error', message: 'Error in testAnthropicKey ' + error };
  }
}

// Menu item 'Remove DeepL API key for user / all documents'
function removeDeepLAPIkeyUser() {
  removeAPIkeyUser('DeepLAPIkey');
}

// Menu item 'Remove DeepL API key for document'
function removeDeepLAPIkeyDoc() {
  removeAPIkeyDoc('DeepLAPIkey');
}

// Menu item 'Remove ChatGPT API key for user / all documents'
function removeChatGPTAPIkeyUser() {
  removeAPIkeyUser('ChatGPTAPIkey');
}

// Menu item 'Remove ChatGPT API key for document'
function removeChatGPTAPIkeyDoc() {
  removeAPIkeyDoc('ChatGPTAPIkey');
}

function removeAPIkeyUser(propertyName) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty(propertyName);
  onOpen();
}


function removeAPIkeyDoc(propertyName) {
  const docProperties = PropertiesService.getDocumentProperties();
  docProperties.deleteProperty(propertyName);
  onOpen();
}

// translateSelectionAndAppendL uses the function
// propertyName: 'DeepLAPIkey' or 'ChatGPTAPIkey'
function getDeepLAPIkey(storage, propertyName) {
  let properties;
  if (storage == 'user') {
    properties = PropertiesService.getUserProperties();
  } else {
    properties = PropertiesService.getDocumentProperties();
  }
  const key = properties.getProperty(propertyName);
  return key;
}



// Menu item 'Copy user DeepL API key to document'
function copyUserDeepLApiKeyToDocument() {
  copyUserApiKeyToDocument('DEEPL');
}

// Menu item 'Copy user ChatGPT API key to document'
function copyUserChatGPTApiKeyToDocument() {
  copyUserApiKeyToDocument('CHATGPT');
}

// old
// Menu item 'Copy user API key to document'
function copyUserApiKeyToDocument(translator) {
  const translatorName = PROPERTY_NAMES[translator]['textName'];
  const propertyName = PROPERTY_NAMES[translator]['propertyApiKeyName'];
  let deeplApiKeyUser = getDeepLAPIkey('user', propertyName);
  if (deeplApiKeyUser == null) {
    alert("Error! " + translatorName + " API key for user/all documents doesn't exist. Add it.");
    keyResult = enterDeepLAPIkey('user', translator);
    if (keyResult.status == 'ok') {
      deeplApiKeyUser = keyResult.apiKey;
    } else if (keyResult.status == 'error') {
      return 0;
    }
  }
  properties = PropertiesService.getDocumentProperties();
  properties.setProperty(propertyName, deeplApiKeyUser);
  onOpen();
}

// 2024
function copyUserApiKeyToDocStorage(translator) {
  const translatorName = PROPERTY_NAMES[translator]['textName'];
  const propertyName = PROPERTY_NAMES[translator]['propertyApiKeyName'];
  let deeplApiKeyUser = getDeepLAPIkey('user', propertyName);
  if (deeplApiKeyUser == null) {
    return { status: 'error', message: "Error! " + translatorName + " API key for user/all documents doesn't exist. Add it." };
  }
  properties = PropertiesService.getDocumentProperties();
  properties.setProperty(propertyName, deeplApiKeyUser);
  return { status: 'ok' };
}