import { OutputSection } from "./components/output";
import { SettingsSection } from "./components/settings";
import { StateManager } from "./state";
import { DurationSection } from "./components/duration";

const handlers = {
  OpenSettings: CardService.newAction().setFunctionName("OpenSettings"),
  SaveSettings: CardService.newAction().setFunctionName("SaveSettings"),
  CloseSettings: CardService.newAction().setFunctionName("CloseSettings"),
};

/**
 * App is the main function that builds the app.
 */
export function App() {
  const state = new StateManager();

  return CardService.newCardBuilder()
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newDecoratedText()
          .setText("Settings")
          .setBottomLabel("Change the default settings.")
          .setButton(
            CardService.newTextButton()
              .setText("Edit")
              .setOnClickAction(handlers.OpenSettings)
          )
          .setWrapText(true)
      )
    )
    .addSection(DurationSection(state))
    .addSection(OutputSection(state))
    .build();
}

/**
 * Settings is the function that builds the settings card.
 */
export function Settings() {
  const state = new StateManager().getState();

  return CardService.newCardBuilder()
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newDecoratedText()
          .setText("Settings")
          .setBottomLabel("Change the default settings.")
          .setWrapText(true)
          .setButton(
            CardService.newTextButton()
              .setText("Back")
              .setOnClickAction(handlers.CloseSettings)
          )
      )
    )
    .addSection(SettingsSection(state))
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newTextButton()
          .setText("Save settings")
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor("#4f46e5")
          .setOnClickAction(handlers.SaveSettings)
      )
    )
    .build();
}

/**
 * This is the function that gets called from onchange events in the app.
 * @returns A CardNavigation object that renders the app with the new state.
 */
export function SaveSettings(e: GoogleAppsScript.Addons.EventObject) {
  emptyUserCache();
  saveUserSettings(e.commonEventObject.formInputs);

  const nav = CardService.newActionResponseBuilder()
    .setStateChanged(true)
    .setNavigation(CardService.newNavigation().popToRoot())
    .setNavigation(CardService.newNavigation().updateCard(App()))
    .build();

  return nav;
}

/**
 * This is a function that gets called from button click on the App card.
 * @returns A CardNavigation object that renders the app card.
 */
export function Generate(e: GoogleAppsScript.Addons.EventObject) {
  saveCache(e.commonEventObject.formInputs);
  return CardService.newNavigation().updateCard(App());
}

/**
 * This is a function that gets called from button click on the App card.
 * @returns A CardNavigation object that renders the app card.
 */
export function EmptyCache() {
  emptyUserCache();
  return CardService.newNavigation().updateCard(App());
}

/**
 * OpenSettings is the function that gets called when the settings button is clicked.
 * @returns A CardNavigation object that opens the settings card.
 */
export function OpenSettings() {
  return CardService.newNavigation().pushCard(Settings());
}

/**
 * CloseSettings is the function that gets called when the settings card is closed.
 * @returns A CardNavigation object that closes the settings card without saving.
 */
export function CloseSettings() {
  return CardService.newNavigation().popCard();
}

/**
 * Save the form inputs to short term cache.
 */
function saveCache(
  formInputs: GoogleAppsScript.Addons.CommonEventObject["formInputs"]
) {
  const cache = CacheService.getUserCache();
  const cacheDuration = 1800;

  const duration = getStringInput(formInputs, "duration");

  const startDate = formInputs.startDate.dateInput?.msSinceEpoch;
  if (!startDate) {
    throw new Error("Start date is required");
  }

  const endDate = formInputs.endDate.dateInput?.msSinceEpoch;
  if (!endDate) {
    throw new Error("End date is required");
  }

  cache.put("duration", duration, cacheDuration);
  cache.put("startDate", JSON.stringify(new Date(startDate)), cacheDuration);
  cache.put("endDate", JSON.stringify(new Date(endDate)), cacheDuration);
}

/**
 * Remove the short term cache.
 */
function emptyUserCache() {
  CacheService.getUserCache().removeAll(["duration", "startDate", "endDate"]);
}

/**
 * Save the state to UserProperties
 * @param formInput The formInput from the event object
 */
function saveUserSettings(
  formInputs: GoogleAppsScript.Addons.CommonEventObject["formInputs"]
) {
  const duration = getStringInput(formInputs, "duration");
  const numDays = getStringInput(formInputs, "numDays");

  const startOfDay = getTimeInput(formInputs, "startOfDay");
  const endOfDay = getTimeInput(formInputs, "endOfDay");

  const includeWeekends =
    getStringInput(formInputs, "includeWeekends", false) === "true";
  const includeToday =
    getStringInput(formInputs, "includeToday", false) === "true";
  const language = getStringInput(formInputs, "language");
  const template = getStringInput(formInputs, "template", false);

  const settings = {
    duration,
    numDays,
    startOfDay,
    endOfDay,
    includeWeekends,
    includeToday,
    language,
    template,
  };

  PropertiesService.getUserProperties().setProperty(
    "settings",
    JSON.stringify(settings)
  );
}

/**
 * Get a string input from the form inputs.
 * @param formInputs The formInput from the event object
 * @param name The name of the input
 * @param isRequired Whether the input is required
 */
function getStringInput(
  formInputs: GoogleAppsScript.Addons.CommonEventObject["formInputs"],
  name: string,
  isRequired: boolean = true
) {
  const inputExists = formInputs[name]?.stringInputs != null;

  if (isRequired && !inputExists) {
    throw new Error(`${name} is required`);
  }

  if (!inputExists) {
    return "";
  }

  return formInputs[name]?.stringInputs?.value[0] ?? "";
}

/**
 * Get timeInput from the form inputs.
 * @param formInputs The formInput from the event object
 * @param name The name of the input
 * @param isRequired Whether the input is required
 */
function getTimeInput(
  formInputs: GoogleAppsScript.Addons.CommonEventObject["formInputs"],
  name: string,
  isRequired: boolean = true,
  defaultValue: { hours: number; minutes: number } = { hours: 0, minutes: 0 }
) {
  const inputExists = formInputs[name] != null;

  if (isRequired && !inputExists) {
    throw new Error(`${name} is required`);
  }

  if (!inputExists) {
    return defaultValue;
  }

  const timeInputExists = formInputs[name].timeInput != null;
  if (!timeInputExists) {
    return defaultValue;
  }

  const formInput = formInputs[name].timeInput;

  if (!formInput) {
    return defaultValue;
  }

  // Apparently minutes is not set if the user doesn't change it from 0.
  // So we set it to 0 :)))
  if (formInput.minutes == null) {
    formInput.minutes = 0;
  }

  return formInput;
}
