// Menu item 'Enable DeepL by entering API key'
function enterDeepLAPIkey() {
  var key = getValueFromUser("Please enter the developer key");
  key = key.trim();
  if (key != null && key != '') {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('DeepLAPIkey', key);
  }
}

// translateSelectionAndAppendL uses the function
function getDeepLAPIkey() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('DeepLAPIkey');
  return key;
}

// Test for getDeepLAPIkey()
function logDeepLAPIkey() {
  var key = getDeepLAPIkey()
  Logger.log(key);
}
