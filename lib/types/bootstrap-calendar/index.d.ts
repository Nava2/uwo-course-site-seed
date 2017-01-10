/**
 * Calendar Definitions
 */

type EventClass = 'event-important' | 'event-success' |
    'event-warning' | 'event-info' |
    'event-inverse' | 'event-special';

type Language = 'ar-SA' | 'bg-BG' | 'bs-BA' |
  'ca-ES' | 'cs-CZ' | 'da-DK' |
  'de-AT' | 'de-DE' | 'el-GR' |
  'es-CO' | 'es-ES' | 'es-MX' |
  'fi-FI' | 'fr-FR' | 'hr-HR' |
  'hu-HU' | 'id-ID' | 'it-IT' |
  'ja-JP' | 'ko-KR' | 'ms-MY' |
  'nl-NL' | 'no-NO' | 'pl-PL' |
  'pt-BR' | 'ro-RO' | 'ru-RU' |
  'sk-SR' | 'sl-SL' | 'sv-SE' |
  'th-TH' | 'tr-TR' | 'zh-CN' |
  'zh-TW';

interface CalendarEvent {
  id: number;
  url: string;

  title: string;
  'class': EventClass;
  start: number;
  end: number;
}

type CalendarEventSource = (()=>CalendarEvent[]) | CalendarEvent[] | string;

type CalendarView = 'year' | 'month' | 'week' | 'day';

type CalendarNav = 'prev' | 'today' | 'next';

type CalendarEventsCallback = (events: CalendarEvent[])=>void;

interface CalendarConfig {
  view?: CalendarView;

  day?: string | Date;

  format12?: boolean;
  display_week_numbers?: boolean;
  weekbox?: boolean;
  modal?: boolean;

  tmpl_path?: string;
  tmpl_cache?: boolean;

  language?: Language;

  events_source: CalendarEventSource;

  onBeforeEventsLoad?:  (next: ()=>void)=>void;
  onAfterEventsLoad?:   CalendarEventsCallback;

  onAfterModalShown?:   CalendarEventsCallback;
  onAfterModalHidden?:  CalendarEventsCallback;

  /**
   * Called when the view shows, passing the view.
   * @param {CalendarView} view View type of calendar showing
   */
  onAfterViewLoad?: (view: CalendarView)=>void;

  holidays?: Map<string, string>;
}

interface JQuery {

  calendar(config: CalendarConfig): Calendar;
}

interface Calendar {
  navigate: (nav: CalendarNav) => void;

  view: (view?: CalendarView) => void;

  setOptions: (config?: CalendarConfig) => void;

  /**
   * true if showing today.
   */
  isToday: () => boolean;

  getYear: () => number;
  getMonth: () => string;
  getDay:  () => number;

  getStartDate: () => Date;
  getEndDate: () => Date;

  getEventsBetween: (start: Date, end: Date) => Event[];
}

declare module "bootstrap-calendar" {

}
