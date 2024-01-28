import { StateManager } from "../state";
import { type Lang, getI18n } from "../i18n";
import { Slot, getSlots } from "../slots";

/**
 * OutputSection builds the output section of the app.
 * @returns A CardSection with the output.
 */
export function OutputSection(state: StateManager) {
  const duration = state.getDuration();
  const i18n = getI18n(state.getLanguage());

  // Get the available time slots
  const availableTimeSlots = getSlots({
    from: new Date(state.getStartDate()),
    to: new Date(state.getEndDate()),
    duration: duration,
    includeWeekends: state.getState().settings.includeWeekends,
    daily: {
      from: [
        state.getState().settings.startOfDay.hours,
        state.getState().settings.startOfDay.minutes,
      ],
      to: [
        state.getState().settings.endOfDay.hours,
        state.getState().settings.endOfDay.minutes,
      ],
    },
  });

  // Get the template
  const template =
    state.getTemplate().length > 0 ? state.getTemplate() : i18n.defaultTemplate;

  // Format the time slots
  const timeSlots = formatTimeSlots(availableTimeSlots, i18n);

  // Build the output section
  return CardService.newCardSection()
    .addWidget(
      CardService.newDecoratedText()
        .setText("Snippet")
        .setBottomLabel("Found " + availableTimeSlots.length + " time slots.")
    )
    .addWidget(
      CardService.newTextInput()
        .setFieldName("output")
        .setMultiline(true)
        .setValue(
          template
            .replace("{{duration}}", duration.toString())
            .replace("{{suggestion_list}}", timeSlots)
        )
    );
}

/**
 * formatTimeSlots formats a list of time slots into a string.
 * @param timeSlots the list of time slots.
 * @param i18n the i18n object.
 * @returns A string with the formatted time slots.
 */
function formatTimeSlots(timeSlots: Slot[], i18n: Lang): string {
  return timeSlots
    .map(slot => {
      return formatDateRange(slot.start, slot.end, i18n);
    })
    .join("\n");
}

/**
 * formatDateRange formats a date range into a string.
 * @param start The start date.
 * @param end The end date.
 * @param i18n The i18n object.
 * @returns A string with the formatted date range.
 */
function formatDateRange(start: Date, end: Date, i18n: Lang) {
  // format the date as dd/mm
  const formatDate = (date: Date) => {
    return (
      `${date.getDate().toString().padStart(2, "0")}/` +
      `${(date.getMonth() + 1).toString().padStart(2, "0")}`
    );
  };

  // format the time as hh:mm
  const formatTime = (date: Date) => {
    return (
      `${date.getHours().toString().padStart(2, "0")}:` +
      `${date.getMinutes().toString().padStart(2, "0")}`
    );
  };

  // Determine if the date is today, tomorrow, or another day
  const today = formatDate(new Date());
  const tomorrow = formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24));

  let dayLabel: string;

  if (formatDate(start) === today) {
    dayLabel = i18n.today;
  } else if (formatDate(start) === tomorrow) {
    dayLabel = i18n.tomorrow;
  } else {
    dayLabel = i18n.weekDays[start.getDay()];
  }

  return `${dayLabel} (${formatDate(start)}) – ${formatTime(
    start
  )}-${formatTime(end)}`;
}
