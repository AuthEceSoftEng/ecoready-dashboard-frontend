import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
// detect user language
// learn more: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	.use(initReactI18next)
// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		debug: false,
		fallbackLng: "en",
		resources: {
			en: {
				translation: {
					examples: {
						example1: "This is an example of a translation",
						example2: "This is another example of a translation",
					},
				},
			},
			gr: {
				translation: {
					examples: {
						example1: "Αυτό είναι ένα παράδειγμα μετάφρασης",
						example2: "Αυτό είναι ένα άλλο παράδειγμα μετάφρασης",
					},
				},
			},
		},
	});

export { default } from "i18next";
