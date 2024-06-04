function translateTextOpenAI(inputText, sourceLang, targetLang, apiKey, modelSettings, preserveFormatting) {
  try {
    let { temperature, maxTokens, customPrompt, useDefaultPrompt, model } = { ...modelSettings };

    if (useDefaultPrompt === true) {
      customPrompt = settings.OpenAI.defaultPrompt;
    }
    let systemMessage = customPrompt.replaceAll('<T>', targetLang);
    systemMessage = systemMessage.replaceAll('<S>', sourceLang);

    if (preserveFormatting) {
      systemMessage += ' Preserve html tags.';
    }

    const url = 'https://api.openai.com/v1/chat/completions';
    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: model,
        // "messages": [{ "role": "user", "content": inputText + '\nTranslate to ' + targetLang }],
        "messages": [
          { "role": "system", "content": systemMessage },
          { "role": "user", "content": inputText }
        ],
        //"max_tokens": maxTokens,
        "temperature": temperature
      }),
      muteHttpExceptions: false
    };

    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (json.choices[0].finish_reason === 'length') {
      throw new Error('Error in translateTextOpenAI: ' + JSON.stringify(json.usage));
    }

    if (json.error || json.warning) {
      const errorOrWarning = json.error ? json.error : json.warning;
      const message = typeof errorOrWarning === 'object' ? JSON.stringify(errorOrWarning) : errorOrWarning;
      throw new Error('Error in translateTextOpenAI: ' + message);
    }

    if (!json.choices?.[0]?.message?.content) {
      throw new Error('Error in translateTextOpenAI: unexpected api.openai.com response.');
    }

    return json.choices[0].message.content;
  }
  catch (e) {
    return e;
  }
}

// translateSelectionAndAppendL uses the function
function getOpenAIURL(txt, from, to) {
  return 'https://chat.openai.com/';
};
