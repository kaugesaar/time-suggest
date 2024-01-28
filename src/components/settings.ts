import { type State } from "../state";
import { Divider } from "./divider";

/**
 * SettingsSection builds the settings section of the app.
 * @returns A CardSection with the settings.
 */
export function SettingsSection(state: State) {
  return CardService.newCardSection()
    .addWidget(Divider)
    .addWidget(DurationInput(state.settings.duration))
    .addWidget(Divider)
    .addWidget(Divider)
    .addWidget(NumDaysInput(state.settings.numDays))
    .addWidget(Divider)
    .addWidget(Divider)
    .addWidget(
      HourInput("startOfDay", "Start of day", state.settings.startOfDay)
    )
    .addWidget(HourInput("endOfDay", "End of day", state.settings.endOfDay))
    .addWidget(InlcudeWeekendsInput(state.settings.includeWeekends))
    .addWidget(IncludeTodayInput(state.settings.includeToday))
    .addWidget(Divider)
    .addWidget(LanguageSelector(state.settings.language))
    .addWidget(
      SettingsHeader(
        "Template settings",
        "Change the default template.",
        "https://github.com/kaugesaar/time-suggestion#template"
      )
    )
    .addWidget(TemplateEditor(state.settings?.template));
}

/**
 * SettingsHeader builds a header for a settings widget.
 * @param title the title to display in the header.
 * @param description the description to display in the header.
 * @returns the header widget.
 */
function SettingsHeader(
  title: string,
  description: string,
  href?: string,
  linkLabel?: string
) {
  const text = CardService.newDecoratedText()
    .setText(`<small>${title}</small>`)
    .setBottomLabel(description)
    .setWrapText(true);

  if (href) {
    text.setButton(
      CardService.newTextButton()
        .setText(linkLabel || "Guide")
        .setOpenLink(CardService.newOpenLink().setUrl(href))
    );
  }

  return text;
}

/**
 * TemplateEditor builds the template editor widget.
 * @param template the template to set the widget to.
 * @returns the template editor widget.
 */
function TemplateEditor(template?: string) {
  return CardService.newTextInput()
    .setFieldName("template")
    .setTitle("Template")
    .setMultiline(true)
    .setValue(template || "");
}

/**
 * LanguageSelector builds the language selector widget.
 * @param language the language to set the widget to.
 * @returns the language selector widget.
 */
function LanguageSelector(language?: string) {
  if (!language) language = "EN";
  return CardService.newSelectionInput()
    .setFieldName("language")
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Language")
    .addItem("English", "EN", language === "EN")
    .addItem("Swedish", "SV", language === "SV");
}

/**
 * DurationInput builds the duration input widget.
 * @param duration the duration to set the input to.
 * @returns the duration input widget.
 */
function DurationInput(duration?: string) {
  // Add 5 min incremental suggestions.
  const durationSuggestions = () => {
    return CardService.newSuggestions().addSuggestions(
      Array.from({ length: 30 }, (_, i) => (15 + i * 5).toString())
    );
  };

  return CardService.newTextInput()
    .setFieldName("duration")
    .setTitle("Duration (minutes)")
    .setSuggestions(durationSuggestions())
    .setValue(duration || "25");
}

/**
 * NumDaysInput builds the num days input widget.
 * @param numDays the num days to set the input to.
 * @returns the num days input widget.
 */
function NumDaysInput(numDays?: string) {
  // Just make som simple duation suggestion with 5 min
  // incremental suggestions. You can enter w/e you want.
  const numDaysSuggestions = () => {
    return CardService.newSuggestions().addSuggestions(
      Array.from({ length: 30 }, (_, i) => (1 + i).toString())
    );
  };

  return CardService.newTextInput()
    .setFieldName("numDays")
    .setTitle("Number of days")
    .setSuggestions(numDaysSuggestions())
    .setValue(numDays || "5");
}

/**
 * defaultHour is the default hour to set the hour input to.
 * @param name the name of the input.
 * @param title the title of the input.
 * @param time the time to set the input to.
 * @returns the hour input widget.
 */
function HourInput(
  name: string,
  title: string,
  time?: GoogleAppsScript.Addons.TimeInputObject
) {
  const defaultHour = name === "start_time" ? 8 : 17;
  return CardService.newTimePicker()
    .setFieldName(name)
    .setTitle(title)
    .setHours(time?.hours || defaultHour)
    .setMinutes(time?.minutes || 0);
}

/**
 * IncludeInput builds an include input widget.
 * @param name the name of the input.
 * @param title the title of the input.
 * @param label the label of the input.
 * @param include the include to set the input to.
 * @returns the include input widget.
 */
function IncludeInput(
  name: string,
  title: string,
  label: string,
  include: boolean
) {
  const toggle = CardService.newSwitch()
    .setFieldName(name)
    .setControlType(CardService.SwitchControlType.SWITCH)
    .setSelected(include)
    .setValue("true");

  return CardService.newDecoratedText()
    .setText(title)
    .setBottomLabel(label)
    .setSwitchControl(toggle);
}

/**
 * InlcudeWeekendsInput builds the include weekends input widget.
 * @param includeWeekends the include weekends to set the input to.
 * @returns the include weekends input widget.
 */
function InlcudeWeekendsInput(includeWeekends: boolean) {
  return IncludeInput(
    "includeWeekends",
    "Include weekends",
    "Include weekends in the suggestions.",
    includeWeekends
  );
}

/**
 * IncludeTodayInput builds the include today input widget.
 * @param includeToday the include today to set the input to.
 * @returns the include today input widget.
 */
function IncludeTodayInput(includeToday: boolean) {
  return IncludeInput(
    "includeToday",
    "Include today",
    "Include today in the suggestions.",
    includeToday
  );
}
