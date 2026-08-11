// const isNode = typeof window === 'undefined';
// const windowObj = isNode ? { localStorage: new Map() } : window;
// const storage = windowObj.localStorage;

// const toSnakeCase = (str) => {
// 	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
// }

// const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
// 	if (isNode) {
// 		return defaultValue;
// 	}
// 	const storageKey = `base44_${toSnakeCase(paramName)}`;
// 	const urlParams = new URLSearchParams(window.location.search);
// 	const searchParam = urlParams.get(paramName);
// 	if (removeFromUrl) {
// 		urlParams.delete(paramName);
// 		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
// 			}${window.location.hash}`;
// 		window.history.replaceState({}, document.title, newUrl);
// 	}
// 	if (searchParam) {
// 		storage.setItem(storageKey, searchParam);
// 		return searchParam;
// 	}
// 	if (defaultValue) {
// 		storage.setItem(storageKey, defaultValue);
// 		return defaultValue;
// 	}
// 	const storedValue = storage.getItem(storageKey);
// 	if (storedValue) {
// 		return storedValue;
// 	}
// 	return null;
// }

// const getAppParams = () => {
// 	if (getAppParamValue("clear_access_token") === 'true') {
// 		storage.removeItem('base44_access_token');
// 		storage.removeItem('token');
// 	}
// 	return {
// 		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
// 		token: getAppParamValue("access_token", { removeFromUrl: true }),
// 		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
// 		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
// 		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
// 	}
// }


// export const appParams = {
// 	...getAppParams()
// }
const isNode = typeof window === 'undefined';

/** * ১. স্টোরেজ পলিফিল: 
 * Node.js বা SSR এনভায়রনমেন্টে localStorage থাকে না, 
 * তাই একটি মক অবজেক্ট তৈরি করা হয়েছে যাতে কোড ক্র্যাশ না করে।
 */
const storage = !isNode ? window.localStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

const toSnakeCase = (str) => {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * ২. ইউটিলিটি ফাংশন: URL বা LocalStorage থেকে ভ্যালু সংগ্রহ করা
 */
export const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
    if (isNode) return defaultValue;

    const storageKey = `base44_${toSnakeCase(paramName)}`;
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get(paramName);

    // URL থেকে টোকেন বা সেনসিটিভ ডাটা মুছে ফেলা (Clean UI এর জন্য)
    if (removeFromUrl && searchParam) {
        const newParams = new URLSearchParams(window.location.search);
        newParams.delete(paramName);
        const queryString = newParams.toString();
        const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
        window.history.replaceState({}, document.title, newUrl);
    }

    // ১. প্রথমে URL চেক করা
    if (searchParam) {
        storage.setItem(storageKey, searchParam);
        return searchParam;
    }

    // ২. URL-এ না থাকলে স্টোরেজ চেক করা
    const storedValue = storage.getItem(storageKey);
    if (storedValue) return storedValue;

    // ৩. কোথাও না থাকলে ডিফল্ট ভ্যালু পাঠানো
    return defaultValue;
}

/**
 * ৩. মেইন প্যারামিটার কনফিগারেশন
 */
const getAppParams = () => {
    if (isNode) return {};

    // এক্সেস টোকেন ক্লিয়ার করার লজিক
    if (getAppParamValue("clear_access_token") === 'true') {
        storage.removeItem('base44_access_token');
        storage.removeItem('token');
    }

    return {
        appId: getAppParamValue("app_id", { 
            defaultValue: import.meta.env.VITE_BASE44_APP_ID 
        }),
        token: getAppParamValue("access_token", { 
            removeFromUrl: true 
        }),
        fromUrl: getAppParamValue("from_url", { 
            defaultValue: window.location.href 
        }),
        functionsVersion: getAppParamValue("functions_version", { 
            defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION 
        }),
        appBaseUrl: getAppParamValue("app_base_url", { 
            defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL 
        }),
    }
}

// ৪. এক্সপোর্ট - এটি ফাইল লোড হওয়ার সাথে সাথেই এক্সিকিউট হবে
export const appParams = getAppParams();