import { StateManager } from "../state";
import { Divider } from "./divider";

// Generate is the action that gets called when the user presses the generate button.
const Generate = CardService.newAction().setFunctionName("Generate");
// EmptyCache is the action that gets called when the user presses the reset button.
const EmptyCache = CardService.newAction().setFunctionName("EmptyCache");

export function DurationSection(state: StateManager) {
  const duration = state.getDuration().toString();
  const startDate = state.getStartDate();
  const endDate = state.getEndDate();

  return CardService.newCardSection()
    .addWidget(Divider)
    .addWidget(DurationInput(duration))
    .addWidget(Divider)
    .addWidget(DatePicker("Start date", "startDate", new Date(startDate)))
    .addWidget(Divider)
    .addWidget(DatePicker("End date", "endDate", new Date(endDate)))
    .addWidget(Divider)
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("Generate")
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor("#4f46e5")
            .setOnClickAction(Generate)
        )
        .addButton(
          CardService.newTextButton()
            .setText("Reset")
            .setOnClickAction(EmptyCache)
        )
    );
}

/**
 * DurationInput builds the duration input widget.
 * @param duration the duration to set the input to.
 * @returns the duration input widget.
 */
function DurationInput(duration: string) {
  // Just make som simple duation suggestion with 5 min
  // incremental suggestions. You can enter w/e you want.
  const durationSuggestions = () => {
    return CardService.newSuggestions().addSuggestions(
      Array.from({ length: 30 }, (_, i) => (15 + i * 5).toString())
    );
  };

  return CardService.newTextInput()
    .setFieldName("duration")
    .setTitle("Duration (minutes)")
    .setHint("Enter a duration in minutes")
    .setSuggestions(durationSuggestions())
    .setValue(duration || "25");
}

/**
 * DatePicker builds a date picker widget.
 * @param title the title to display in the widget.
 * @param name the name of the widget.
 * @param value the value to set the widget to.
 * @returns the date picker widget.
 */
function DatePicker(title: string, name: string, date: Date) {
  return CardService.newDatePicker()
    .setTitle(title)
    .setFieldName(name)
    .setValueInMsSinceEpoch(date.getTime());
}
