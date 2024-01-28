import { LanguageCode } from "./i18n";

/**
 * Type definition for the application state.
 */
export type State = {
  cache: GoogleAppsScript.Cache.Cache;
  settings: {
    duration: string;
    startOfDay: GoogleAppsScript.Addons.TimeInputObject;
    endOfDay: GoogleAppsScript.Addons.TimeInputObject;
    template: string;
    language: LanguageCode;
    numDays: string;
    includeWeekends: boolean;
    includeToday: boolean;
  };
};

/**
 * Class for managing application state.
 */
export class StateManager {
  private state: State;

  /**
   * Constructs a new StateManager instance.
   */
  constructor() {
    this.state = this.loadUserState();
  }

  /**
   * Loads the user state from the UserProperties.
   * @returns The loaded state object.
   */
  private loadUserState(): State {
    const settings =
      PropertiesService.getUserProperties().getProperty("settings");
    return settings
      ? {
          cache: CacheService.getUserCache(),
          settings: JSON.parse(settings) as State["settings"],
        }
      : {
          cache: CacheService.getUserCache(),
          settings: {
            duration: "25",
            startOfDay: { hours: 9, minutes: 0 },
            endOfDay: { hours: 17, minutes: 0 },
            template: "",
            language: "EN",
            numDays: "5",
            includeWeekends: false,
            includeToday: true,
          },
        };
  }

  /**
   * Retrieves the state.
   * @returns The state object.
   */
  getState(): State {
    return this.state;
  }

  /**
   * Retrieves the duration from the state.
   * @returns The duration in minutes.
   */
  getDuration(): number {
    return (
      Number(this.state.cache.get("duration")) ||
      Number(this.state.settings.duration)
    );
  }

  /**
   * Retrieves the duration in milliseconds.
   * @returns The duration in milliseconds.
   */
  getDurationInMs(): number {
    return this.getDuration() * 60 * 1000;
  }

  /**
   * Retrieves the start date from the state.
   * @returns The start date as a timestamp.
   */
  getStartDate(): number {
    const cachedStartDate = this.state.cache.get("startDate");
    if (cachedStartDate) {
      return new Date(JSON.parse(cachedStartDate)).getTime();
    }

    if (this.state.settings.includeToday) {
      return new Date().getTime();
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    return startDate.getTime();
  }

  /**
   * Retrieves the end date from the state.
   * @returns The end date as a timestamp.
   */
  getEndDate(): number {
    const cachedEndDate = this.state.cache.get("endDate");
    if (cachedEndDate) {
      return new Date(JSON.parse(cachedEndDate)).getTime();
    }

    const endDate = new Date();
    const numDays = Number(this.state.settings.numDays);

    if (this.state.settings.includeToday) {
      endDate.setDate(endDate.getDate() + numDays - 1);
      return endDate.getTime();
    }

    endDate.setDate(endDate.getDate() + numDays);
    return endDate.getTime();
  }

  /**
   * Retrives the language from the state.
   * @returns The language code.
   */
  getLanguage(): LanguageCode {
    return this.state.settings.language;
  }

  /**
   * Retrieves the template from the state.
   * @returns The template.
   */
  getTemplate(): string {
    return this.state.settings.template;
  }
}
