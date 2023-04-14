// buildMenu, submenu_09_translate_full use the function
function submenu_09_translate_basic(e) {
  let actionNameUser, actionNameDoc, tryToRetrieveProperties;

  const TrMenu = DocumentApp.getUi().createMenu('bTranslate');

  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    actionNameUser = 'Add/change';
    actionNameDoc = 'Add/change';
    TrMenu.addItem('Activate menu', 'activateMenu');
    tryToRetrieveProperties = false;
  } else {
    const deeplApiKeyUser = getDeepLAPIkey('user');
    actionNameUser = deeplApiKeyUser == null ? 'Add' : 'Change';

    const deeplApiKeyDoc = getDeepLAPIkey('doc');
    actionNameDoc = deeplApiKeyDoc == null ? 'Add' : 'Change';

    tryToRetrieveProperties = true;
  }

  if (tryToRetrieveProperties === true) {
    const translationSettings = getTranslationSettings();
    let j = 1;
    let key, translators, formality, version;
    for (let i in translationSettings.menuOrder) {
      translators = [];
      key = translationSettings.menuOrder[i];
      // List of translators
      for (let j in translationSettings[key].targets) {
        if (translationSettings[key].targets[j].hasOwnProperty('deepL')) {
          if (translationSettings[key].targets[j].form == 'default') {
            formality = '';
          } else {
            formality = translationSettings[key].targets[j].form == 'less' ? ' informal' : ' formal';
          }
          if (['EN-US', 'EN-GB', 'PT-BR', 'PT-PT'].includes(translationSettings[key].targets[j].deepL)) {
            version = ' ' + translationSettings[key].targets[j].deepL;
          } else {
            version = '';
          }

          translators.push('DeepL' + version + formality);
        }
        if (translationSettings[key].targets[j].hasOwnProperty('google')) {
          if (['zh-CN', 'zh-TW'].includes(translationSettings[key].targets[j].google)) {
            version = ' ' + translationSettings[key].targets[j].google;
          } else {
            version = '';
          }
          translators.push('Google' + version);
        }
      }
      // End. List of translators
      TrMenu.addItem("tra" + j + " " + translationSettings[key].sourceTarget + ' (' + translators.join(', ') + ')', 'translationSlots.s' + j + '.run');
      j++;
    }

    if (j == 1) {
      TrMenu.addItem('Add translation settings', 'showTranslationSettingsDialog')
    }
  }

  TrMenu.addSeparator()
    .addItem('Translation settings', 'showTranslationSettingsDialog')
    .addItem('Clear translation settings', 'clearTranslationSettings')
    .addItem('Example settings: Google', 'exampleTranslationSettingsGoogle')
    .addItem('Example settings: DeepL', 'exampleTranslationSettingsDeepL');

  TrMenu.addSeparator();

  const activeFormatStyle = getFormatSettings(tryToRetrieveProperties);
  let selectedStyleMarker = '';
  for (let formatStyle in formatStyles) {
    selectedStyleMarker = formatStyle === activeFormatStyle.style ? activeFormatStyle.marker + ' ' : '';
    TrMenu.addItem(selectedStyleMarker + formatStyles[formatStyle].menuText, 'formatStyles.' + formatStyle + '.run');
  }

  TrMenu.addSeparator();

  /* end of main items */

  /* start submenu 1: Utilities */
  TrMenu.addSubMenu(DocumentApp.getUi().createMenu('Utilities')
    .addItem('sps split paragraphs to sentences [select paragraphs or place cursor in para] pts', 'splitParasInDocumentB')
    .addItem('spt split off selected text [select text]', 'splitOffSelectedText')
    .addItem('spp split off selected text, then paras [select text]', 'splitOffSelectedText_thenSplitParas')
    .addItem('mps merge sentences to paragraphs [select paragraphs] stp', 'mergeParasInDocumentB')
    .addItem('htse highlight translation start/end', 'highlightTranslationStartEnd')
  );
  /* end submenu 1 */
  /* start submenu 2: Manage DeepL API */
  /* Note: API key used in 09c */
  const submenu2 = DocumentApp.getUi().createMenu('Manage DeepL API');
  submenu2.addItem(actionNameUser + ' API key for user / all documents', 'enterDeepLAPIkeyUser')
    .addItem('Remove API key for user / all documents', 'removeDeepLAPIkeyUser')
    .addItem('Copy user API key to document', 'copyUserApiKeyToDocument')
    .addItem(actionNameDoc + ' API key for document', 'enterDeepLAPIkeyDoc')
    .addItem('Remove API key for document', 'removeDeepLAPIkeyDoc')
    .addSeparator();

  const activeDeeplApiKeySettings = getDeeplApiKeySettings(tryToRetrieveProperties);

  for (let settings in deeplApiKeySettings) {
    selectedSettingsMarker = settings == activeDeeplApiKeySettings.settings ? activeDeeplApiKeySettings.marker + ' ' : '  ';
    submenu2.addItem(selectedSettingsMarker + deeplApiKeySettings[settings].menuText, 'deeplApiKeySettings.' + settings + '.run');
  }

  submenu2.addSeparator()
    .addItem('gdlu get DeepL usage and costs', 'getDeepLUsage');

  /* end submenu: Manage DeepL API */

  TrMenu.addSubMenu(submenu2);

  return TrMenu;
};

function activateMenu() {
  onOpen();
}


function exampleTranslationSettingsGoogle() {
  const translationSettings = { "enam": { "sourceTarget": "English->Amharic", "targets": [{ "name": "Amharic", "google": "am" }], "source": { "deepL": "EN", "google": "en" } }, "menuOrder": ["enam", "amen", "enar", "aren", "enzh-CNzh-TW", "zhen", "enfr", "fren", "ende", "deen", "enka", "kaen", "enhi", "hien", "enkri", "krien", "enru", "ruen", "enes", "esen", "enzu", "zuen"], "amen": { "sourceTarget": "Amharic->English", "source": { "google": "am" }, "targets": [{ "name": "English", "google": "en" }] }, "aren": { "sourceTarget": "Arabic->English", "source": { "google": "ar" }, "targets": [{ "name": "English", "google": "en" }] }, "enar": { "source": { "deepL": "EN", "google": "en" }, "targets": [{ "google": "ar", "name": "Arabic" }], "sourceTarget": "English->Arabic" }, "enzh-CNzh-TW": { "sourceTarget": "English->Chinese", "targets": [{ "google": "zh-CN", "name": "Chinese (simplified)" }, { "name": "Chinese (Traditional)", "google": "zh-TW" }], "source": { "google": "en", "deepL": "EN" } }, "zhen": { "source": { "google": "zh", "deepL": "ZH" }, "targets": [{ "name": "English", "google": "en" }], "sourceTarget": "Chinese->English" }, "enfr": { "targets": [{ "google": "fr", "name": "French" }], "sourceTarget": "English->French", "source": { "deepL": "EN", "google": "en" } }, "fren": { "source": { "google": "fr", "deepL": "FR" }, "targets": [{ "name": "English", "google": "en" }], "sourceTarget": "French->English" }, "ende": { "sourceTarget": "English->German", "source": { "google": "en", "deepL": "EN" }, "targets": [{ "google": "de", "name": "German" }] }, "deen": { "targets": [{ "google": "en", "name": "English" }], "source": { "deepL": "DE", "google": "de" }, "sourceTarget": "German->English" }, "enka": { "source": { "google": "en", "deepL": "EN" }, "targets": [{ "name": "Georgian", "google": "ka" }], "sourceTarget": "English->Georgian" }, "kaen": { "targets": [{ "google": "en", "name": "English" }], "source": { "google": "ka" }, "sourceTarget": "Georgian->English" }, "enhi": { "sourceTarget": "English->Hindi", "targets": [{ "google": "hi", "name": "Hindi" }], "source": { "google": "en", "deepL": "EN" } }, "hien": { "sourceTarget": "Hindi->English", "targets": [{ "google": "en", "name": "English" }], "source": { "google": "hi" } }, "enkri": { "targets": [{ "google": "kri", "name": "Krio" }], "sourceTarget": "English->Krio", "source": { "google": "en", "deepL": "EN" } }, "krien": { "source": { "google": "kri" }, "sourceTarget": "Krio->English", "targets": [{ "google": "en", "name": "English" }] }, "enru": { "targets": [{ "google": "ru", "name": "Russian" }], "sourceTarget": "English->Russian", "source": { "deepL": "EN", "google": "en" } }, "ruen": { "source": { "deepL": "RU", "google": "ru" }, "targets": [{ "google": "en", "name": "English" }], "sourceTarget": "Russian->English" }, "enes": { "targets": [{ "google": "es", "name": "Spanish" }], "sourceTarget": "English->Spanish", "source": { "google": "en", "deepL": "EN" } }, "esen": { "targets": [{ "google": "en", "name": "English" }], "sourceTarget": "Spanish->English", "source": { "deepL": "ES", "google": "es" } }, "enzu": { "sourceTarget": "English->Zulu", "targets": [{ "google": "zu", "name": "Zulu" }], "source": { "deepL": "EN", "google": "en" } }, "zuen": { "sourceTarget": "Zulu->English", "source": { "google": "zu" }, "targets": [{ "google": "en", "name": "English" }] } };
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('TRANSLATION_SETTINGS', JSON.stringify(translationSettings));

  onOpen();
}

function exampleTranslationSettingsDeepL() {
  const translationSettings = { "enar": { "sourceTarget": "English->Arabic", "targets": [{ "google": "ar", "name": "Arabic" }], "source": { "deepL": "EN", "google": "en" } }, "menuOrder": ["enar", "aren", "enFRfr", "frEN-USEN-GBen", "enDEde", "deEN-USEN-GBen", "enRUru", "ruEN-USEN-GBen", "enESes", "esEN-USEN-GBen"], "aren": { "sourceTarget": "Arabic->English", "source": { "google": "ar" }, "targets": [{ "name": "English", "google": "en" }] }, "enFRfr": { "sourceTarget": "English->French", "targets": [{ "name": "French", "deepL": "FR", "form": "more" }, { "google": "fr", "name": "French" }], "source": { "deepL": "EN", "google": "en" } }, "frEN-USEN-GBen": { "source": { "google": "fr", "deepL": "FR" }, "targets": [{ "deepL": "EN-US", "name": "English (American)", "form": "default" }, { "deepL": "EN-GB", "form": "default", "name": "English (British)" }, { "google": "en", "name": "English" }], "sourceTarget": "French->English" }, "enDEde": { "source": { "deepL": "EN", "google": "en" }, "targets": [{ "name": "German", "form": "more", "deepL": "DE" }, { "name": "German", "google": "de" }], "sourceTarget": "English->German" }, "deEN-USEN-GBen": { "sourceTarget": "German->English", "source": { "deepL": "DE", "google": "de" }, "targets": [{ "deepL": "EN-US", "name": "English (American)", "form": "default" }, { "name": "English (British)", "form": "default", "deepL": "EN-GB" }, { "google": "en", "name": "English" }] }, "enRUru": { "source": { "google": "en", "deepL": "EN" }, "sourceTarget": "English->Russian", "targets": [{ "form": "more", "deepL": "RU", "name": "Russian" }, { "name": "Russian", "google": "ru" }] }, "ruEN-USEN-GBen": { "sourceTarget": "Russian->English", "source": { "deepL": "RU", "google": "ru" }, "targets": [{ "name": "English (American)", "form": "default", "deepL": "EN-US" }, { "form": "default", "name": "English (British)", "deepL": "EN-GB" }, { "name": "English", "google": "en" }] }, "enESes": { "sourceTarget": "English->Spanish", "targets": [{ "name": "Spanish", "deepL": "ES", "form": "more" }, { "google": "es", "name": "Spanish" }], "source": { "google": "en", "deepL": "EN" } }, "esEN-USEN-GBen": { "sourceTarget": "Spanish->English", "targets": [{ "form": "default", "deepL": "EN-US", "name": "English (American)" }, { "deepL": "EN-GB", "form": "default", "name": "English (British)" }, { "name": "English", "google": "en" }], "source": { "deepL": "ES", "google": "es" } } };
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('TRANSLATION_SETTINGS', JSON.stringify(translationSettings));
  onOpen();
}

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

const htmlColourNames = { "orange": "#FFA500" };

// translateSelectionAndAppendL uses the function
function highlightTranslationStartEnd() {
  setBothTextColors("《translation(START|END)S》", "#000000", htmlColourNames["orange"]);
  setBothTextColors("《(\\!\\!\\!|\\+)》", htmlColourNames["orange"], "#444444");
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

// Menu item 'tra12 translate selection and append ('+lang1+'->'+lang2+')' (out-of-use)
function translateSelectionAndAppend12() {
  translateSelectionAndAppendL(lang1, lang2);
};

// Menu item 'tra21 translate selection and append ('+lang2+'->'+lang1+')' (out-of-use)
function translateSelectionAndAppend21() {
  translateSelectionAndAppendL(lang2, lang1);
};

// Menu item (out-of-use)
function translateSelectionAndAppend13() {
  translateSelectionAndAppendL(lang1, lang3);
};

// Menu item (out-of-use)
function translateSelectionAndAppend31() {
  translateSelectionAndAppendL(lang3, lang1);
};

// Menu item (out-of-use)
function translateSelectionAndAppend14() {
  translateSelectionAndAppendL(lang1, lang4);
};

// Menu item (out-of-use)
function translateSelectionAndAppend41() {
  translateSelectionAndAppendL(lang4, lang1);
};

// Menu item (commented out) (out-of-use)
function translateSelectionAndAppend15() {
  translateSelectionAndAppendL(lang1, lang5);
};

// Menu item (commented out) (out-of-use)
function translateSelectionAndAppend51() {
  translateSelectionAndAppendL(lang5, lang1);
};

// Menu item (commented out) (out-of-use)
function translateSelectionAndAppend16() {
  translateSelectionAndAppendL(lang1, lang6);
};

// Menu item (commented out) (out-of-use)
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