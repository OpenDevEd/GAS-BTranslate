// Menu item 'Add API key for user / all documents'
function enterDeepLAPIkeyUser() {
  enterDeepLAPIkey('user');
}

// Menu item 'Add/change API key for document' 
function enterDeepLAPIkeyDoc() {
  enterDeepLAPIkey('doc');
}

function enterDeepLAPIkey(storage) {
  let properties;
  const storageDesc = storage == 'user' ? 'user / all documents' : 'document';
  let apiKey = getValueFromUser('DeepL API key', 'Please enter the DeepL API key for ' + storageDesc);
  if (apiKey == null) {
    return { status: 'error' };
  }
  apiKey = apiKey.trim();
  if (apiKey != '') {
    const result = testDeeplKey(apiKey);
    if (result.status == 'ok') {
      if (storage == 'user') {
        properties = PropertiesService.getUserProperties();
      } else {
        properties = PropertiesService.getDocumentProperties();
      }
      properties.setProperty('DeepLAPIkey', apiKey);
      onOpen();
      return { status: 'ok',  apiKey: apiKey};
    } else {
      alert(result.message);
    }
  }
  return { status: 'error' };
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

// Menu item 'Remove API key for user / all documents'
function removeDeepLAPIkeyUser() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('DeepLAPIkey');
  onOpen();
}

// Menu item 'Remove API key for document'
function removeDeepLAPIkeyDoc() {
  const docProperties = PropertiesService.getDocumentProperties();
  docProperties.deleteProperty('DeepLAPIkey');
  onOpen();
}

// translateSelectionAndAppendL uses the function
function getDeepLAPIkey(storage) {
  let properties;
  if (storage == 'user') {
    properties = PropertiesService.getUserProperties();
  } else {
    properties = PropertiesService.getDocumentProperties();
  }
  const key = properties.getProperty('DeepLAPIkey');
  return key;
}

// Test for getDeepLAPIkey()
function logDeepLAPIkeyUser() {
  const key = getDeepLAPIkey('user')
  Logger.log(key);
}

// Test for getDeepLAPIkey()
function logDeepLAPIkeyDoc() {
  const key = getDeepLAPIkey('doc')
  Logger.log(key);
}
