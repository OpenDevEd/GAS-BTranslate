function defaultLlmSettings() {
  let yesBackDefault = true;

  const properties = PropertiesService.getUserProperties();
  let arrayTranslators = properties.getProperty('AI_MODELS');

  if (arrayTranslators != null) {
    yesBackDefault = getConfirmationFromUser('You\'ve already set up translators. Do you want to back to default settings?');
  }

  if (yesBackDefault === true) {
    setDefaultAiModelsAndChats();
  }
}

function setDefaultAiModelsAndChats() {
  const properties = PropertiesService.getUserProperties();
  let arrayTranslators = {
    OpenAI: [DEFAULT_OPENAI_MODEL],
    Anthropic: [DEFAULT_ANTHROPIC_MODEL]
  };
  setAiModels(arrayTranslators);
  onOpen();

  return JSON.stringify(arrayTranslators);
}