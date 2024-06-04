// translateSelectionAndAppendL uses the function
function translateTextDeepL(txt, from, to, formality, apiKey, preserveFormatting) {
  try {
    const url = 'https://api.deepl.com/v2/translate';

    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'DeepL-Auth-Key ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        'text': [
          txt
        ],
        'source_lang': from,
        'target_lang': to,
        'formality': formality
      }),
      muteHttpExceptions: false
    };

  if (preserveFormatting === true){
    options.payload.tag_handling = 'html';
  }

    const response = UrlFetchApp.fetch(url, options);
    const json = response.getContentText();
    const data = JSON.parse(json);
    if ('translations' in data) {
      return data.translations[0].text;
    } else {
      return json;
    }
  }
  catch (e) {
    return e;
  }
}

// translateSelectionAndAppendL uses the function
function getDeepLURL(txt, from, to) {
  return "https://www.deepl.com/translator#" + from + "/" + to + "/" + encodeURIComponent(txt);
};

// Menu item 'gdlu get DeepL usage and costs'
function getDeepLUsage() {
  const apikey = getDeepLAPIkey('user', 'DeepLAPIkey');
  if (apikey == null) {
    alert('Add DeepL API key for user / all documents.');
    return 0;
  }
  var url = "https://api.deepl.com/v2/usage?auth_key=" + apikey
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  var cost = data["character_count"] / 500 * 0.01;
  var maxcost = data["character_limit"] / 500 * 0.01;
  var str = "Character count = " + data["character_count"] + "\n"
    + "Cost: €" + cost + "\n"
    + "Character limit = " + data["character_limit"] + "\n"
    + "Max cost: €" + maxcost;
  alert(str);
};
