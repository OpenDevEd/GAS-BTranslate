function translateTextOpenAI(inputText, targetLang, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      model: "gpt-3.5-turbo",
      "messages": [{ "role": "user", "content": inputText + '\nTranslate to ' + targetLang }],
      "temperature": 0.3
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  // Logger.log(json);

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

// translateSelectionAndAppendL uses the function
function getOpenAIURL(txt, from, to) {
  return 'https://chat.openai.com/';
};
