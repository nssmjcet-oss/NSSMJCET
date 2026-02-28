/**
 * Simple translation utility using Google Translate's public API
 * Used for auto-translating English text to Hindi and Telugu in the admin panel.
 */

export async function translateText(text, targetLang) {
    if (!text || text.trim().length === 0) return '';

    // Hindi code is 'hi', Telugu is 'te'
    const langMap = {
        hindi: 'hi',
        telugu: 'te',
        hi: 'hi',
        te: 'te'
    };

    const target = langMap[targetLang] || targetLang;

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Translation request failed');
        }

        const data = await response.json();

        // Google returns an array of arrays, we need to join the text parts
        // format: [[[ "translated text", "original text", null, null, 1 ]], null, "en"]
        if (data && data[0]) {
            return data[0].map(item => item[0]).join('');
        }

        return '';
    } catch (error) {
        console.error('Translation error:', error);
        return '';
    }
}
