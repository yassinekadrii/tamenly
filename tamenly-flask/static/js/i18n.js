/**
 * @file public/js/i18n.js
 * @description Internationalization (i18n) logic for multi-language support (FR, EN, AR).
 * 
 * Handles:
 * - Loading translations from translations.json
 * - Language switching and persistence (localStorage)
 * - RTL/LTR direction switching for Arabic support
 * - Dynamic text replacement using data-i18n attributes
 */

const translationsUrl = './translations.json';
let translations = {};
let currentLang = localStorage.getItem('lang') || 'fr';

async function initI18n() {
    try {
        const response = await fetch(translationsUrl);
        translations = await response.json();
        applyLanguage(currentLang);
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Set document direction and language attribute
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Switch body font for Arabic to something more readable
    document.body.classList.remove('rtl', 'lang-en', 'lang-fr', 'lang-ar');
    document.body.classList.add(`lang-${lang}`);
    
    if (lang === 'ar') {
        document.body.style.fontFamily = "'Inter', 'Arial', sans-serif";
        document.body.classList.add('rtl');
    } else {
        document.body.style.fontFamily = "'Inter', sans-serif";
    }

    // Apply translations to all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(lang, key);
        if (translation) {
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'password' || element.type === 'tel')) {
                element.placeholder = translation;
            } else {
                element.innerText = translation;
            }
        }
    });

    // Update active state of language buttons if they exist
    const langBtn = document.getElementById('langSwitcher');
    if (langBtn) {
        langBtn.innerText = lang.toUpperCase();
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.id === 'langSwitcher') return;
        if (btn.getAttribute('onclick').includes(lang)) {
            btn.style.fontWeight = 'bold';
            btn.style.opacity = '1';
        } else {
            btn.style.fontWeight = 'normal';
            btn.style.opacity = '0.7';
        }
    });
}

function getNestedTranslation(lang, key) {
    const keys = key.split('.');
    let result = translations[lang];
    for (const k of keys) {
        if (result && result[k]) {
            result = result[k];
        } else {
            return null;
        }
    }
    return result;
}

function setLanguage(lang) {
    applyLanguage(lang);
}

function toggleLanguage() {
    const langs = ['en', 'fr', 'ar'];
    let nextIndex = (langs.indexOf(currentLang) + 1) % langs.length;
    applyLanguage(langs[nextIndex]);
}

// Initial load
document.addEventListener('DOMContentLoaded', initI18n);
