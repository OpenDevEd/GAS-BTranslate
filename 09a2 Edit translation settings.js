function menuOrderSidebar() {
  universalSidebar('09a3 Sidebar HTML Menu order', 'bTranslate: Menu items order');
}

function testLogger(){
  Logger.log(JSON.stringify(getTranslationSettings()))
}

function getTranslationSettingsJson() {
  return JSON.stringify(getTranslationSettings());
}

function setNewMenuOrderServerside(newMenuOrder, binnedItems) {
  const translationSettings = getTranslationSettings();
  if (!translationSettings.hasOwnProperty('menuOrder')) {
    throw new Error('translationSettings doesn\'t contain menuOrder key.');
  }

  translationSettings['menuOrder'] = newMenuOrder;

  for (let key in binnedItems) {
    delete translationSettings[binnedItems[key]];
  }

  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('TRANSLATION_SETTINGS', JSON.stringify(translationSettings));

  const result = {
    status: 'ok', updatedTranslationSettings: translationSettings
  };
  //Logger.log(finalSettings);
  onOpen();
  return result;
}