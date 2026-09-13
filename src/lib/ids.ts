/** Demo jornada uses 910xxx. SofaScore / SportAPI event ids are larger 8-digit values. */
export function isDemoEventId(eventId: number) {
  return eventId >= 910000 && eventId < 920000;
}
