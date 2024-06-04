function testHtmlToStyle() {
  const htmlString = '<b>Equity</b> and <i>evidence</i> are at the heart of our <a href="https://opendeved.net/">approach</a>.';

  const { stylesArray, textString } = htmlToStyle(htmlString);
  Logger.log(stylesArray);
  Logger.log(textString);
}

function htmlToStyle(htmlString) {
  const { tagsArray, textString } = parseHtmlString(htmlString);

  const stylesArray = transformArray(tagsArray);

  return { stylesArray, textString };
}

function parseHtmlString(htmlString) {
  const tagsArray = [];
  let textString = '';
  let pos = 0;
  const regex = /<([^>]+)>|([^<]+)/g;
  let match;
  while ((match = regex.exec(htmlString)) !== null) {
    if (match[1]) {
      const tagMatch = /(a|i|b)(\s+href=([^\s]+))?/.exec(match[1]);
      if (tagMatch) {
        const tag = tagMatch[1];
        const link = tagMatch[3];
        const end = match[1][0] === '/';
        tagsArray.push({ tag, end, p: pos, ...(link && { link }) });
      }
    } else {
      textString += match[2];
      pos += match[2].length;
    }
  }
  return { tagsArray, textString };
}

function transformArray(inputArray) {
  const result = [];
  let activeTags = [];

  for (let i = 0; i < inputArray.length; i++) {
    const current = inputArray[i];

    if (current.end === false) {
      // Add the current tag to activeTags
      activeTags.push(current);
    } else {
      // Find the matching opening tag
      const openingTagIndex = activeTags.findIndex(tag => tag.tag === current.tag);
      if (openingTagIndex !== -1) { // Ensure the opening tag exists
        const openingTag = activeTags[openingTagIndex];

        const resultIndex = result.findIndex(style => style.start === openingTag.p && style.end === current.p);
 
        const tagsRange = activeTags.map(tagObj => {
          if (tagObj.tag === 'a') {
            return { tag: tagObj.tag, link: tagObj.link };
          } else {
            return { tag: tagObj.tag };
          }
        });

        if (resultIndex === -1) {
          result.push({
            tags: tagsRange,
            start: openingTag.p,
            end: current.p
          });
        }

        // Remove the matched opening tag from activeTags
        activeTags.splice(openingTagIndex, 1);
      }
    }
  }

  return result;
}