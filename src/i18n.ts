export type LanguageCode = keyof typeof lang;

export type Lang = {
  today: string;
  tomorrow: string;
  weekDays: string[];
  defaultTemplate: string;
};

export function getI18n(language: LanguageCode): Lang {
  if (!lang[language]) return lang["EN"];
  return lang[language] as Lang;
}

const lang = {
  EN: {
    today: "Today",
    tomorrow: "Tomorrow",
    weekDays: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    defaultTemplate: `Would {{duration}} min work during any of these times?\n\n{{suggestion_list}}`,
  },
  SV: {
    today: "Idag",
    tomorrow: "Imorgon",
    weekDays: [
      "Söndag",
      "Måndag",
      "Tisdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Lördag",
    ],
    defaultTemplate: `Skulle {{duration}} min fungera under någon av dessa tider?\n\n{{suggestion_list}}`,
  },
};
