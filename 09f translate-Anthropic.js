function translateTextAnthropic(inputText, sourceLang, targetLang, apiKey, modelSettings, preserveFormatting) {
  try {
    let { temperature, maxTokens, customPrompt, useDefaultPrompt, model } = { ...modelSettings };
    if (useDefaultPrompt === true) {
      customPrompt = settings.Anthropic.defaultPrompt;
    }
    let systemMessage = customPrompt.replaceAll('<T>', targetLang);
    systemMessage = systemMessage.replaceAll('<S>', sourceLang);

    if (preserveFormatting) {
      systemMessage += ' Preserve html tags.';
    }

    const url = 'https://api.anthropic.com/v1/messages';
    const headers = {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    };
    const payload = {
      "model": model,
      "max_tokens": Number(maxTokens),
      "system": systemMessage,
      "temperature": Number(temperature),
      "messages": [
        { "role": "user", "content": inputText }
      ]
    };

    const options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());

    if (data.stop_reason === 'max_tokens') {
      throw new Error(`The maximum number of tokens was reached.`);
    }

    if (data.error) {
      throw new Error(`API error: ${data.error.message}`);
    }

    return { status: 'ok', message: data.content[0].text};
  }
  catch (e) {
    return { status: 'error', message: e };
  }
}
