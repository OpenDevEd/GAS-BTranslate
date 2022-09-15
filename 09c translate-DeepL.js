var apikey = "";

//might consider using post? https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String)
// translateSelectionAndAppendL uses the function
function translateTextDeepL(txt, from, to, formality) {
  var url = "https://api.deepl.com/v2/translate?auth_key=" + apikey +
    "&source_lang=" + from.toUpperCase() + "&target_lang=" + to.toUpperCase() + "&formality=" + formality + "&text=" + encodeURIComponent(txt);
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  if ('translations' in data) {
    return data.translations[0].text;
  } else {
    return json;
  };
};

// translateSelectionAndAppendL uses the function
function getDeepLURL(txt, from, to) {
  return "https://www.deepl.com/translator#" + from + "/" + to + "/" + encodeURIComponent(txt);
};

// Menu item 'gdlu get DeepL usage and costs'
function getDeepLUsage() {
  const apikey = getDeepLAPIkey();
  if (apikey == null) {
    alert('Please enable DeepL by entering API key.');
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
