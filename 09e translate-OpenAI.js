function translateTextOpenAI(inputText, sourceLang, targetLang, apiKey, modelSettings, preserveFormatting) {
  try {
    // Logger.log(`OpenAI _${inputText}_`);
    let { temperature, maxTokens, customPrompt, useDefaultPrompt, model } = { ...modelSettings };

    if (useDefaultPrompt === true) {
      customPrompt = settings.OpenAI.defaultPrompt;
    }
    let systemMessage = customPrompt.replaceAll('<T>', targetLang);
    systemMessage = systemMessage.replaceAll('<S>', sourceLang);

    if (preserveFormatting) {
      systemMessage += ' Preserve html tags.';
    }

    const messagesArray = [{ "role": "user", "content": inputText }];
    let payloadJson;
    if (['gpt-5.2', 'gpt-5.2-pro', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'o1-preview', 'o1-preview-2024-09-12', 'o1-mini', 'o1-mini-2024-09-12', 'o4-mini', 'o3', 'gpt-4o-search-preview', 'gpt-4o-mini-search-preview'].includes(model)) {
      messagesArray.unshift({ "role": "user", "content": systemMessage });
      payloadJson = {
        model: model,
        "max_completion_tokens": Number(maxTokens),
        "messages": messagesArray,
        //"temperature": Number(temperature)
      }
    } else {
      messagesArray.unshift({ "role": "system", "content": systemMessage });
      payloadJson = {
        model: model,
        "max_tokens": Number(maxTokens),
        "messages": messagesArray,
        "temperature": Number(temperature)
      }
    }


    const url = 'https://api.openai.com/v1/chat/completions';
    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payloadJson),
      muteHttpExceptions: false
    };

    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    // Logger.log(json);
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

    return { status: 'ok', message: json.choices[0].message.content };
  }
  catch (e) {
    return { status: 'error', message: e };
  }
}
