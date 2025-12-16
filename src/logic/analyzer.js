import javascript from './languages/javascript';
import python from './languages/python';

const languages = {
    javascript,
    python
};

export const analyzeCode = (code, langKey = 'javascript') => {
    const langModule = languages[langKey];
    
    if (!langModule) {
        console.error(`Language ${langKey} not supported`);
        return null;
    }

    try {
        const tokens = langModule.tokenize(code);
        const ast = langModule.parse(tokens);
        return langModule.calculateMetrics(ast, tokens);
    } catch (e) {
        console.error("Analysis failed", e);
        return null;
    }
};