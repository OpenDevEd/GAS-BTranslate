// translateSelectionAndAppendL uses the function
function getgtrURL(txt, origin, dest) {
  return "https://translate.google.com/#view=home&op=translate&sl=" + origin + "&tl=" + dest + "&text=" + encodeURIComponent(txt);
}

// translateSelectionAndAppendL use the function
function translateText(text, origin, dest) {
  try {
    // Logger.log(`Google _${text}_`);
    //if (origin === dest) return text; 
    return { status: 'ok', message: LanguageApp.translate(text, origin, dest)};
  }
  catch (e) {
    return { status: 'error', message: e };
  }
}