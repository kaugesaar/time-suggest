import { OutputSection } from "./components/output";
import { SettingsSection } from "./components/settings";
import { StateManager } from "./state";
import { DurationSection } from "./components/duration";

/**
 * App is the main function that builds the app.
 */
export function App() {
  // OpenSettings is the action that gets called when the settings button is clicked.
  const OpenSettings = CardService.newAction().setFunctionName("OpenSettings");
  // Load the state from UserProperties
  const state = new StateManager();
  // Build the app
  return CardService.newCardBuilder()
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newDecoratedText()
          .setText("Settings")
          .setBottomLabel("Change the default settings.")
          .setButton(
            CardService.newTextButton()
              .setText("Edit")
              .setOnClickAction(OpenSettings)
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
  // SaveSettings is the action that gets called when the app changes.
  const SaveSettings = CardService.newAction().setFunctionName("SaveSettings");
  // CloseSettings is the action that gets called when the settings card is closed.
  const CloseSettings =
    CardService.newAction().setFunctionName("CloseSettings");
  // Load the state from UserProperties
  const state = new StateManager().getState();
  // Build the settings card
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
              .setOnClickAction(CloseSettings)
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
          .setOnClickAction(SaveSettings)
      )
    )
    .build();
}

/**
 * This is the function that gets called from onchange events in the app.
 * @returns A CardNavigation object that renders the app with the new state.
 */
export function SaveSettings(e: GoogleAppsScript.Addons.EventObject) {
  // Remove the cache so we don't use the old state.
  CacheService.getUserCache().removeAll(["duration", "startDate", "endDate"]);
  // Save the settings to UserProperties
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
  // Save the form inputs to short term cache.
  // Currently set to 30 minutes.
  saveCache(e.commonEventObject.formInputs);

  return CardService.newNavigation().updateCard(App());
}

/**
 * This is a function that gets called from button click on the App card.
 * @returns A CardNavigation object that renders the app card.
 */
export function EmptyCache() {
  CacheService.getUserCache().removeAll(["duration", "startDate", "endDate"]);
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
  const cacheDuration = 1800; // 30 minutes

  // Get the duration
  const duration = getStringInput(formInputs, "duration");

  // Get the start date
  const startDate = formInputs.startDate.dateInput?.msSinceEpoch;
  if (!startDate) {
    throw new Error("Start date is required");
  }

  // Get the end date
  const endDate = formInputs.endDate.dateInput?.msSinceEpoch;
  if (!endDate) {
    throw new Error("End date is required");
  }

  cache.put("duration", duration, cacheDuration);
  cache.put("startDate", JSON.stringify(new Date(startDate)), cacheDuration);
  cache.put("endDate", JSON.stringify(new Date(endDate)), cacheDuration);
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

  const startOfDay = formInputs.startOfDay.timeInput;
  if (!startOfDay) {
    throw new Error("Start of day is required");
  }
  // Apparently minutes is not set if the user doesn't change it.
  if (!startOfDay.minutes) {
    startOfDay.minutes = 0;
  }

  const endOfDay = formInputs.endOfDay.timeInput;
  if (!endOfDay) {
    throw new Error("End of day is required");
  }
  // Apparently minutes is not set if the user doesn't change it.
  if (!endOfDay.minutes) {
    endOfDay.minutes = 0;
  }

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
  const inputExists = formInputs[name]?.stringInputs !== null;

  if (isRequired && !inputExists) {
    throw new Error(`${name} is required`);
  }

  if (!inputExists) {
    return "";
  }

  return formInputs[name]?.stringInputs?.value[0] ?? "";
}
