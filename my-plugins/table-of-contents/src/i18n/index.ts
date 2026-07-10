import enUS from "./locales/en-US";
import enGB from "./locales/en-GB";
import esES from "./locales/es-ES";

const locales: Record<string, typeof enUS> = {
  "en-US": enUS,
  "en-GB": enGB,
  "es-ES": esES,
};

export function i18n(locale: string) {
  return locales[locale] || enUS;
}
