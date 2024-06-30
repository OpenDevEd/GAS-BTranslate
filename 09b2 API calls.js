function callAllTranslators(translationsArray, translationsToInsert, elementText, elementTextWithoutHtml, deepLArray, googleArray, openAIArray, anthropicArray, deepLApiKey, chatGPTApiKey, anthropicApiKey, ltrLang, ltrLangReverse, preserveFormatting, appendReverseTranslation, reverseTranslationFlag) {
              // translate using OpenAI API and insert
              for (let j in openAIArray) {
                //Logger.log('%s %s %s', elementText, openAIArray[j].origin, openAIArray[j].dest);
                function localOpenAI(elementText, origin, dest, reverseTranslated) {
                  let reverseTranslatedMark = '';
                  let lastSymbolLinkText = '》';
                  let localLtr = ltrLang;
                  let out = translateTextOpenAI(elementText, origin, dest, chatGPTApiKey, openAIArray[j].settings, preserveFormatting);
                  if (reverseTranslated === true) {
                    out.message += '》';
                    reverseTranslatedMark = ' reverse-translated';
                    lastSymbolLinkText = ':';
                    localLtr = ltrLangReverse;
                  }
                  const trName = openAIArray[j].settings.name === 'openAI' ? LEGACY_OPENAI : openAIArray[j].settings.name;
                  const openAILinkText = '《' + trName + ":" + dest + reverseTranslatedMark + lastSymbolLinkText;
                  const openAIURL = 'https://chat.openai.com/';
                  collectTranslations(translationsArray, translationsToInsert, out.message, openAILinkText, openAIURL, reverseTranslated, localLtr);
                  return out;
                }
                const out = localOpenAI(elementText, openAIArray[j].origin, openAIArray[j].dest, false);
                if (appendReverseTranslation === true && reverseTranslationFlag === false && out.status === 'ok') {
                  localOpenAI(out.message, openAIArray[j].dest, openAIArray[j].origin, true);
                }
              }

              // translate using Anthropic API and insert
              for (let j in anthropicArray) {
                //Logger.log('%s %s %s', elementText, anthropicArray[j].origin, anthropicArray[j].dest);
                function localAnthropic(elementText, origin, dest, reverseTranslated) {
                  let reverseTranslatedMark = '';
                  let lastSymbolLinkText = '》';
                  let localLtr = ltrLang;
                  let out = translateTextAnthropic(elementText, origin, dest, anthropicApiKey, anthropicArray[j].settings, preserveFormatting);
                  if (reverseTranslated === true) {
                    out.message += '》';
                    reverseTranslatedMark = ' reverse-translated';
                    lastSymbolLinkText = ':';
                    localLtr = ltrLangReverse;
                  }
                  const trName = anthropicArray[j].settings.name;
                  const anthropicLinkText = "《" + trName + ":" + dest + reverseTranslatedMark + lastSymbolLinkText;
                  const anthropicURL = 'https://claude.ai/chats';
                  collectTranslations(translationsArray, translationsToInsert, out.message, anthropicLinkText, anthropicURL, reverseTranslated, localLtr);
                  return out;
                }
                const out = localAnthropic(elementText, anthropicArray[j].origin, anthropicArray[j].dest, false);
                if (appendReverseTranslation === true && reverseTranslationFlag === false && out.status === 'ok') {
                  localAnthropic(out.message, anthropicArray[j].dest, anthropicArray[j].origin, true);
                }
              }

              // translate using Google Translate and insert
              for (let j in googleArray) {
                function localGoogle(elementText, origin, dest, reverseTranslated, elementTextWithoutHtml) {
                  //Logger.log('%s %s %s %s %s', elementText, origin, dest, reverseTranslated, elementTextWithoutHtml);
                  let reverseTranslatedMark = '';
                  let lastSymbolLinkText = '》';
                  let localLtr = ltrLang;
                  let out = translateText(elementText, origin, dest);
                  if (reverseTranslated === true) {
                    out.message += '》';
                    reverseTranslatedMark = ' reverse-translated';
                    lastSymbolLinkText = ':';
                    localLtr = ltrLangReverse;
                  }
                  const glinkText = "《G:" + dest + reverseTranslatedMark + lastSymbolLinkText;
                  const gtrURL = getgtrURL(elementTextWithoutHtml, origin, dest);
                  collectTranslations(translationsArray, translationsToInsert, out.message, glinkText, gtrURL, reverseTranslated, localLtr);
                  return out;
                }
                const out = localGoogle(elementText, googleArray[j].origin, googleArray[j].dest, false, elementTextWithoutHtml);
                if (appendReverseTranslation === true && reverseTranslationFlag === false && out.status === 'ok') {
                  const cleanedString = out.message.replace(/<\/?[^>]+(>|$)/g, "");
                  localGoogle(out.message, googleArray[j].dest, googleArray[j].origin, true, cleanedString);
                }
              }

              // translate using DeepL and insert    
              for (let j = 0; j < deepLArray.length; j++) {
                function localDeepL(elementText, origin, dest, formality, reverseTranslated, elementTextWithoutHtml) {
                  let reverseTranslatedMark = '';
                  let lastSymbolLinkText = '》';
                  let localLtr = ltrLang;
                  let out = translateTextDeepL(elementText, origin, dest, formality, deepLApiKey, preserveFormatting);
                  if (reverseTranslated === true) {
                    out.message += '》';
                    reverseTranslatedMark = ' reverse-translated';
                    lastSymbolLinkText = ':';
                    localLtr = ltrLangReverse;
                  }
                  if (formality == 'default') {
                    formality = '';
                  } else {
                    formality = formality == 'less' ? ' informal' : ' formal';
                  }
                  const dLlinkText = '《D:' + dest + formality + reverseTranslatedMark + lastSymbolLinkText;
                  const DeepLURL = getDeepLURL(elementTextWithoutHtml, origin, dest);
                  collectTranslations(translationsArray, translationsToInsert, out.message, dLlinkText, DeepLURL, reverseTranslated, localLtr);
                  return out;
                }
                const out = localDeepL(elementText, deepLArray[j].origin, deepLArray[j].dest, deepLArray[j].formality, false, elementTextWithoutHtml);
                if (appendReverseTranslation === true && reverseTranslationFlag === false && out.status === 'ok') {
                  const cleanedString = out.message.replace(/<\/?[^>]+(>|$)/g, "");
                  let reverseTranslationOrig = deepLArray[j].dest;
                  if (['PT-BR', 'PT-PT'].includes(deepLArray[j].dest)) {
                    reverseTranslationOrig = 'PT';
                  } else if (['EN-GB', 'EN-US'].includes(deepLArray[j].dest)) {
                    reverseTranslationOrig = 'EN';
                  }
                  localDeepL(out.message, reverseTranslationOrig, deepLArray[j].origin, 'default', true, cleanedString);
                }
              }  
}
