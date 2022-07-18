// Chose one primary language
var lang1 = "en";
// Chose three secondary languages:
var lang2 = "de";
var lang3 = "fr";
var lang4 = "ar";

var lang5 = "es";
var lang6 = "pt-pt";

function submenu_09_translate_basic() {
  var TrMenu = DocumentApp.getUi().createMenu('BTranslate')  
  .addItem('sps split paragraphs to sentences [select paragraphs or place cursor in para] pts', 'splitParasInDocumentB')
  .addItem('spt split off selected text [select text]', 'splitOffSelectedText')
  .addItem('spp split off selected text, then paras [select text]', 'splitOffSelectedText_thenSplitParas')
  .addItem('mps merge sentences to paragraphs [select paragraphs] stp', 'mergeParasInDocumentB')
  .addSeparator()
  .addItem('tra12 translate selection and append ('+lang1+'->'+lang2+')', 'translateSelectionAndAppend12')
  .addItem('tra21 translate selection and append ('+lang2+'->'+lang1+')', 'translateSelectionAndAppend21')
  .addItem('tra13 translate selection and append ('+lang1+'->'+lang3+')', 'translateSelectionAndAppend13')
  .addItem('tra31 translate selection and append ('+lang3+'->'+lang1+')', 'translateSelectionAndAppend31')
  .addItem('tra14 translate selection and append ('+lang1+'->'+lang4+')', 'translateSelectionAndAppend14')
  .addItem('tra41 translate selection and append ('+lang4+'->'+lang1+')', 'translateSelectionAndAppend41')
  //.addItem('tra15 translate selection and append ('+lang1+'->'+lang5+')', 'translateSelectionAndAppend15')
  //.addItem('tra16 translate selection and append ('+lang1+'->'+lang6+')', 'translateSelectionAndAppend16')
  .addSeparator()
  // New
  .addItem('Select primary language','...')
  .addItem('Select language 2','...')
  .addItem('Select language 3','...')
  .addItem('Select language 4','...')
  .addSeparator()
  // New
  .addItem('Format: Sequential in text','...')
  .addItem('Format: Primary language in text, rest in footnote','...')
  .addItem('Format: Primary language in text, rest in comment (links are preserved)','...')
  .addSeparator()      
  // New function          
  .addItem('Enable DeepL by entering API key','enterDeepLAPIkey')
  // -> user property: DeepL_API_Key
  /* Note: API key used in 09c */
  .addItem('gdlu get DeepL usage and costs','getDeepLUsage')
  .addItem('htse highlight translation start/end','highlightTranslationStartEnd')
  ;
  return TrMenu;
};

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

function highlightTranslationStartEnd() {
  setBothTextColors("《translation(START|END)S》","#000000",htmlColourNames["orange"]);
  setBothTextColors("《(\\!\\!\\!|\\+)》",htmlColourNames["orange"],"#444444");
};

function translateSelectionAndReplace() {
  // This requires a selection
  translateSelectedTextAndReplace();
};

function translateSelectionAndAppend() {
  translateSelectionAndAppend12();
};

function translateSelectionAndAppendReverse() {
  translateSelectionAndAppend21()
};

function translateSelectionAndAppend12() {
  translateSelectionAndAppendL(lang1,lang2);
};

function translateSelectionAndAppend21() {
  translateSelectionAndAppendL(lang2,lang1);
};

function translateSelectionAndAppend13() {
  translateSelectionAndAppendL(lang1,lang3);
};

function translateSelectionAndAppend31() {
  translateSelectionAndAppendL(lang3,lang1);
};

function translateSelectionAndAppend14() {
  translateSelectionAndAppendL(lang1,lang4);
};

function translateSelectionAndAppend41() {
  translateSelectionAndAppendL(lang4,lang1);
};

function translateSelectionAndAppend15() {
  translateSelectionAndAppendL(lang1,lang5);
};

function translateSelectionAndAppend51() {
  translateSelectionAndAppendL(lang5,lang1);
};

function translateSelectionAndAppend16() {
  translateSelectionAndAppendL(lang1,lang6);
};

function translateSelectionAndAppend61() {
  translateSelectionAndAppendL(lang6,lang1);
};

function clearTranslatedText() {
  singleReplace("《translationOf: [^《》]*?》","",true,false, null);
};

function translateSelectedTextAndReplace() {
  // This requires a selection
  var text = getTextAndTranslation("en","de",true);
  insertText(text.translation);
};
  

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