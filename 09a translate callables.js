// buildMenu, submenu_09_translate_full use the function
function submenu_09_translate_basic(e) {
  let tryToRetrieveProperties, label;
  const TrMenu = DocumentApp.getUi().createMenu('bTranslate');
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    TrMenu.addItem('Activate menu', 'activateMenu');
    tryToRetrieveProperties = false;
  } else {
    tryToRetrieveProperties = true;
  }

  if (tryToRetrieveProperties === true) {
    const translationSettings = getTranslationSettings();
    let j = 1;
    let key, translators, formality, version;
    const totalSettings = translationSettings.menuOrder ? translationSettings.menuOrder.length : 0;
    
    // Create submenu for 5th and following items if there are 5 or more settings
    let otherSettingsSubmenu = null;
    if (totalSettings >= 5) {
      otherSettingsSubmenu = DocumentApp.getUi().createMenu('More translations');
    }
    
    for (let i in translationSettings.menuOrder) {
      translators = [];
      key = translationSettings.menuOrder[i];
      // List of translators
      if (translationSettings[key]) {
        for (let j in translationSettings[key].targets) {
          if (translationSettings[key].targets[j].hasOwnProperty('deepL')) {
            if (translationSettings[key].targets[j].form == 'default') {
              formality = '';
            } else {
              formality = translationSettings[key].targets[j].form == 'less' ? ' informal' : ' formal';
            }
            version = chineseEnglishPortugueseVersionHelper(['EN-US', 'EN-GB', 'PT-BR', 'PT-PT'], translationSettings[key].targets[j].deepL);
            translators.push('DeepL' + version + formality);
          } else if (translationSettings[key].targets[j].hasOwnProperty('google')) {
            version = chineseEnglishPortugueseVersionHelper(['zh-CN', 'zh-TW'], translationSettings[key].targets[j].google);
            translators.push('Google' + version);
          } else {
            const trLLM = getKeyExcludingNameAndForm(translationSettings[key].targets[j])
            version = chineseEnglishPortugueseVersionHelper(['zh-CN', 'zh-TW', 'PT-BR', 'PT-PT'], translationSettings[key].targets[j][trLLM]);

            label = translationSettings[key].targets[j].label;
            if (label == null) {
              label = 'OpenAI ' + LEGACY_OPENAI;
            }
            translators.push(label + version);
          }
        }

        // End. List of translators
        let trSlotName = `tra${j} ${translationSettings[key].sourceTarget} (${translators.join(', ')})`;
        if (trSlotName.length > 50) {
          trSlotName = trSlotName.replaceAll(' formal', ' f.');
          trSlotName = trSlotName.replaceAll(' informal', ' inf.');
        }
        
        // Add to main menu (first 4) or submenu (5th and following)
        if (j <= 4) {
          TrMenu.addItem(trSlotName, 'translationSlots.s' + j + '.run');
        } else {
          otherSettingsSubmenu.addItem(trSlotName, 'translationSlots.s' + j + '.run');
        }
        j++;
      }
    }
    
    // Add the "Other settings" submenu if it was created
    if (otherSettingsSubmenu !== null) {
      TrMenu.addSubMenu(otherSettingsSubmenu);
    }

    if (j == 1) {
      TrMenu.addItem('Add translation settings', 'translationSettingsSidebar')
    }
  }

  TrMenu.addSeparator();

  // Submenu "Translation Settings"
  const menuTranslationSettings = DocumentApp.getUi().createMenu('Translation settings');
  menuTranslationSettings.addItem('Add translation settings', 'translationSettingsSidebar')
  menuTranslationSettings.addItem('Edit translation settings', 'menuOrderSidebar')
  menuTranslationSettings.addItem('Clear translation settings', 'clearTranslationSettings')
  menuTranslationSettings.addItem('Example settings: Google', 'exampleTranslationSettingsGoogle')
  menuTranslationSettings.addItem('Example settings: DeepL', 'exampleTranslationSettingsDeepL');
  menuTranslationSettings.addSeparator();
  greenCheckboxMenuHelper(menuTranslationSettings, tryToRetrieveProperties, 'yes', reverseTranslationStyles, 'reverseTranslationStyles', 'REVERSE_TRANSLATION_SETTINGS');
  TrMenu.addSubMenu(menuTranslationSettings);
  // End.Submenu "Format"

  // Submenu "Format"
  const menuFormat = DocumentApp.getUi().createMenu('Format settings');

  greenCheckboxMenuHelper(menuFormat, tryToRetrieveProperties, 'txt', formatStyles, 'formatStyles', 'FORMAT_SETTINGS');
  menuFormat.addSeparator();

  greenCheckboxMenuHelper(menuFormat, tryToRetrieveProperties, 'yes', preserveFormattingStyles, 'preserveFormattingStyles', 'PRESERVE_FORMATTING_SETTINGS');

  menuFormat.addSeparator();
  greenCheckboxMenuHelper(menuFormat, tryToRetrieveProperties, 'above', aboveBelowStyles, 'aboveBelowStyles', 'ABOVE_BELOW_SETTINGS');

  TrMenu.addSubMenu(menuFormat);
  // End.Submenu "Format"

  TrMenu.addItem('API key management, LLM settings', 'apiKeyManagementSidebar');
  TrMenu.addSeparator();

  /* start submenu 1: Utilities */
  TrMenu.addSubMenu(DocumentApp.getUi().createMenu('Utilities')
    .addItem('sps split paragraphs to sentences [select paragraphs or place cursor in para] pts', 'splitParasInDocumentB')
    .addItem('spt split off selected text [select text]', 'splitOffSelectedText')
    .addItem('spp split off selected text, then paras [select text]', 'splitOffSelectedText_thenSplitParas')
    .addItem('mps merge sentences to paragraphs [select paragraphs] stp', 'mergeParasInDocumentB')
    .addItem('htse highlight translation start/end', 'highlightTranslationStartEnd')
    .addItem('trclm clear all translation markers 《...》', 'leaveOriginalAndTranslation')
    .addItem('trclmo clear all translation markers 《...》 and original text', 'leaveOnlyTranslation')
  );
  /* end submenu 1 */

  TrMenu.addItem('gdlu get DeepL usage and costs', 'getDeepLUsage');

  return TrMenu;
};

function greenCheckboxMenuHelper(TrMenu, tryToRetrieveProperties, defaultSettings, allMenuItemsObj, allMenuItemsObjName, propertyKey) {
  const activeSettings = getSettings(tryToRetrieveProperties, defaultSettings, allMenuItemsObj, propertyKey);
  //const activePreserveFormattingStyle = getPreserveFormattingSettings(tryToRetrieveProperties);
  let selectedSettingsMarker = '';
  for (let key in allMenuItemsObj) {
    selectedSettingsMarker = key === activeSettings.style ? activeSettings.marker + ' ' : '';
    TrMenu.addItem(selectedSettingsMarker + allMenuItemsObj[key].menuText, allMenuItemsObjName + '.' + key + '.run');
  }
}

function chineseEnglishPortugueseVersionHelper(array, target) {
  if (array.includes(target)) {
    version = ' ' + target;
  } else {
    version = '';
  }
  return version;
}

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
  const translationSettings = { "enar": { "sourceTarget": "English->Arabic", "targets": [{ "name": "Arabic", "deepL": "AR", "form": "default" }, { "google": "ar", "name": "Arabic" }], "source": { "deepL": "EN", "google": "en" } }, "menuOrder": ["enar", "aren", "enFRfr", "frEN-USEN-GBen", "enDEde", "deEN-USEN-GBen", "enRUru", "ruEN-USEN-GBen", "enESes", "esEN-USEN-GBen"], "aren": { "sourceTarget": "Arabic->English", "source": { "deepL": "AR", "google": "ar" }, "targets": [{ "deepL": "EN-US", "form": "default", "name": "English (American)" }, { "form": "default", "deepL": "EN-GB", "name": "English (British)" }, { "name": "English", "google": "en" }] }, "enFRfr": { "sourceTarget": "English->French", "targets": [{ "name": "French", "deepL": "FR", "form": "more" }, { "google": "fr", "name": "French" }], "source": { "deepL": "EN", "google": "en" } }, "frEN-USEN-GBen": { "source": { "google": "fr", "deepL": "FR" }, "targets": [{ "deepL": "EN-US", "name": "English (American)", "form": "default" }, { "deepL": "EN-GB", "form": "default", "name": "English (British)" }, { "google": "en", "name": "English" }], "sourceTarget": "French->English" }, "enDEde": { "source": { "deepL": "EN", "google": "en" }, "targets": [{ "name": "German", "form": "more", "deepL": "DE" }, { "name": "German", "google": "de" }], "sourceTarget": "English->German" }, "deEN-USEN-GBen": { "sourceTarget": "German->English", "source": { "deepL": "DE", "google": "de" }, "targets": [{ "deepL": "EN-US", "name": "English (American)", "form": "default" }, { "name": "English (British)", "form": "default", "deepL": "EN-GB" }, { "google": "en", "name": "English" }] }, "enRUru": { "source": { "google": "en", "deepL": "EN" }, "sourceTarget": "English->Russian", "targets": [{ "form": "more", "deepL": "RU", "name": "Russian" }, { "name": "Russian", "google": "ru" }] }, "ruEN-USEN-GBen": { "sourceTarget": "Russian->English", "source": { "deepL": "RU", "google": "ru" }, "targets": [{ "name": "English (American)", "form": "default", "deepL": "EN-US" }, { "form": "default", "name": "English (British)", "deepL": "EN-GB" }, { "name": "English", "google": "en" }] }, "enESes": { "sourceTarget": "English->Spanish", "targets": [{ "name": "Spanish", "deepL": "ES", "form": "more" }, { "google": "es", "name": "Spanish" }], "source": { "google": "en", "deepL": "EN" } }, "esEN-USEN-GBen": { "sourceTarget": "Spanish->English", "targets": [{ "form": "default", "deepL": "EN-US", "name": "English (American)" }, { "deepL": "EN-GB", "form": "default", "name": "English (British)" }, { "name": "English", "google": "en" }], "source": { "deepL": "ES", "google": "es" } } };
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('TRANSLATION_SETTINGS', JSON.stringify(translationSettings));
  onOpen();
}

const htmlColourNames = { "orange": "#FFA500" };

// translateSelectionAndAppendL uses the function
function highlightTranslationStartEnd() {
  setBothTextColors("《translation(START|END)S》", "#000000", htmlColourNames["orange"]);
  setBothTextColors("《(\\!\\!\\!|\\+)》", htmlColourNames["orange"], "#444444");
};

function leaveOnlyTranslation() {
  singleReplace("《[^《》]*?》 ?", "", true, false, null);
  singleReplace("《.*?reverse-translated: ", "", true, false, null);
};

function leaveOriginalAndTranslation() {
  singleReplace("《translationOf: ?", "", true, false, null);
  singleReplace("《[^《》]*?》 ?", "", true, false, null);
  singleReplace("》", "", true, false, null);
  singleReplace("《.*?reverse-translated: ", "", true, false, null);
};

function translationSettingsSidebar() {
  const translationSettings = getTranslationSettings();
  if (translationSettings.hasOwnProperty('menuOrder')) {
    if (translationSettings.menuOrder.length >= 30) {
      alert('You\'ve already added 30 translation settings.');
      return 0;
    }
  }
  universalSidebar('New translation settings', 'bTranslate: Translation settings');
}
