// Chose one primary language
var lang1 = "en";
// Chose three secondary languages:
var lang2 = "de";
var lang3 = "fr";
var lang4 = "ar";

var lang5 = "es";
var lang6 = "pt-pt";

// buildMenu, submenu_09_translate_full use the function
// Make this a sub-menu, called 'Utilities'
function submenu_09_translate_basic() {
  var TrMenu = DocumentApp.getUi().createMenu('bTranslate')
    .addItem('sps split paragraphs to sentences [select paragraphs or place cursor in para] pts', 'splitParasInDocumentB')
    .addItem('spt split off selected text [select text]', 'splitOffSelectedText')
    .addItem('spp split off selected text, then paras [select text]', 'splitOffSelectedText_thenSplitParas')
    .addItem('mps merge sentences to paragraphs [select paragraphs] stp', 'mergeParasInDocumentB')
    .addItem('htse highlight translation start/end', 'highlightTranslationStartEnd')
    .addSeparator();


  const translationSettings = getTranslationSettings();
  let j = 1;
  let key;
  for (let i in translationSettings.menuOrder) {
    key = translationSettings.menuOrder[i];
    TrMenu.addItem("tra"+j+" "+translationSettings[key].sourceTarget, 'translationSlots.s' + j + '.run');
    j++;
  }

  TrMenu.addSeparator()
    .addItem('Translation settings', 'showTranslationSettingsDialog')
    .addItem('Clear translation settings', 'clearTranslationSettings')
    .addItem('Example settings: Google', 'exampleTranslationSettings')
    .addItem('Example settings: DeepL', 'exampleTranslationSettings');
    /*
    Google:
    English->Amharic
    English->Arabic
    English->Chinese
    English->French 
    English->German
    English->Georgian
    English->Hindi
    English->Krio
    English->Russian
    English->Spanish 
    English->Zulu

    DeepL:
    English->German (DeepL:formal, Google)
    German->English (DeepL, Google)
    English->French (DeepL:formal, Google)
    French->English (DeepL, Google)
    English->Spanish (DeepL:formal, Google)
    Spanish->English (DeepL, Google)
    English->Arabic
    English->Chinese
    English->Russion
    (UN languages: Arabic, Chinese, English, French, Russian and Spanish)
    */
  TrMenu.addSeparator();

  const activeFormatStyle = getFormatSettings();
  let selectedStyleMarker = '';
  for (let formatStyle in formatStyles) {
    selectedStyleMarker = formatStyle === activeFormatStyle.style ? ' ' + activeFormatStyle.marker : '';
    TrMenu.addItem(formatStyles[formatStyle].menuText + selectedStyleMarker, 'formatStyles.' + formatStyle + '.run');
  }

TrMenu.addSeparator();
    // New
    TrMenu.addItem('Enable DeepL by entering API key', 'enterDeepLAPIkey')
    /* Note: API key used in 09c */
    .addItem('gdlu get DeepL usage and costs', 'getDeepLUsage')
    ;



  return TrMenu;
};

// out-of-use
function submenu_09_translate_full() {
  return submenu_09_translate_basic()
    .addSeparator()
    .addItem('trr translate selection and replace', 'translateSelectionAndReplace')
    .addItem('trclear delete all translated text 《...》', 'clearTranslatedText')
    .addSeparator()
    .addItem('NOT WORKING trset1 set langauge 1', 'translateSelectionAndAppend')
    .addItem('NOT WORKING trset2 set langauge 2', 'translateSelectionAndAppend')
    .addSeparator()
    //  .addItem('whoami ', 'whoami')              
    ;
};

// translateSelectionAndAppendL uses the function
function highlightTranslationStartEnd() {
  //setBothTextColors("《translation(START|END)S》","#000000",htmlColourNames["orange"]);
  //setBothTextColors("《(\\!\\!\\!|\\+)》",htmlColourNames["orange"],"#444444");
};

// submenu_09_translate_full (out-of-use) adds menu item 'trr translate selection and replace'
function translateSelectionAndReplace() {
  // This requires a selection
  translateSelectedTextAndReplace();
};

// out-of-use
function translateSelectionAndAppend() {
  translateSelectionAndAppend12();
};

// out-of-use
function translateSelectionAndAppendReverse() {
  translateSelectionAndAppend21()
};

// Menu item 'tra12 translate selection and append ('+lang1+'->'+lang2+')'
function translateSelectionAndAppend12() {
  translateSelectionAndAppendL(lang1, lang2);
};

// Menu item 'tra21 translate selection and append ('+lang2+'->'+lang1+')'
function translateSelectionAndAppend21() {
  translateSelectionAndAppendL(lang2, lang1);
};

// Menu item 
function translateSelectionAndAppend13() {
  translateSelectionAndAppendL(lang1, lang3);
};

// Menu item 
function translateSelectionAndAppend31() {
  translateSelectionAndAppendL(lang3, lang1);
};

// Menu item 
function translateSelectionAndAppend14() {
  translateSelectionAndAppendL(lang1, lang4);
};

// Menu item 
function translateSelectionAndAppend41() {
  translateSelectionAndAppendL(lang4, lang1);
};

// Menu item (commented out)
function translateSelectionAndAppend15() {
  translateSelectionAndAppendL(lang1, lang5);
};

// Menu item (commented out)
function translateSelectionAndAppend51() {
  translateSelectionAndAppendL(lang5, lang1);
};

// Menu item (commented out)
function translateSelectionAndAppend16() {
  translateSelectionAndAppendL(lang1, lang6);
};

// Menu item (commented out)
function translateSelectionAndAppend61() {
  translateSelectionAndAppendL(lang6, lang1);
};

// submenu_09_translate_full (out-of-use) adds menu item 'trclear delete all translated text 《...》'
function clearTranslatedText() {
  singleReplace("《translationOf: [^《》]*?》", "", true, false, null);
};

// translateSelectionAndReplace (out-of-use) uses the function
function translateSelectedTextAndReplace() {
  // This requires a selection
  var text = getTextAndTranslation("en", "de", true);
  insertText(text.translation);
};


// More than one!!! 09d translate-Google
// translateSelectedTextAndReplace (out-of-use) uses the function
function getTextAndTranslation(origin, dest, savePrefs) {
  if (savePrefs) {
    PropertiesService.getUserProperties()
      .setProperty('originLang', origin)
      .setProperty('destLang', dest);
  }
  var text = getSelectedText().join('\n');
  return {
    text: text,
    translation: translateText(text, origin, dest)
  };
}