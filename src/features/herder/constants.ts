/**
 * Source of truth for Malchnaas (direct-from-herder) domain constants.
 * Aimag delivery windows are PRD §6.5 estimates — move to backend
 * `aimag_delivery_config` table once it exists.
 */

export interface Province {
  code: string;
  name: string;
  days: string;
}

export const PROVINCES: Province[] = [
  { code: 'AKH',  name: 'Архангай',    days: '7-10'  },
  { code: 'BOL',  name: 'Баян-Өлгий',  days: '10-14' },
  { code: 'BKH',  name: 'Баянхонгор',  days: '7-10'  },
  { code: 'BUL',  name: 'Булган',      days: '5-7'   },
  { code: 'GOA',  name: 'Говь-Алтай',  days: '10-14' },
  { code: 'GOS',  name: 'Говьсүмбэр',  days: '5-7'   },
  { code: 'DAR',  name: 'Дархан-Уул',  days: '3-5'   },
  { code: 'DOR',  name: 'Дорнод',      days: '10-14' },
  { code: 'DOG',  name: 'Дорноговь',   days: '5-7'   },
  { code: 'DUN',  name: 'Дундговь',    days: '7-10'  },
  { code: 'ZAV',  name: 'Завхан',      days: '10-14' },
  { code: 'OVR',  name: 'Өвөрхангай',  days: '7-10'  },
  { code: 'OMN',  name: 'Өмнөговь',    days: '7-10'  },
  { code: 'SUK',  name: 'Сүхбаатар',   days: '7-10'  },
  { code: 'SEL',  name: 'Сэлэнгэ',     days: '5-7'   },
  { code: 'TOV',  name: 'Төв',         days: '3-5'   },
  { code: 'UVS',  name: 'Увс',         days: '10-14' },
  { code: 'KHO',  name: 'Ховд',        days: '10-14' },
  { code: 'KHV',  name: 'Хөвсгөл',     days: '10-14' },
  { code: 'KHE',  name: 'Хэнтий',      days: '7-10'  },
  { code: 'ORK',  name: 'Орхон',       days: '3-5'   },
];

/** Categories — Mongolian folk terms per PRD §6.2. */
export const CATEGORIES = [
  'мах',
  'ноос',
  'арьс',
  'сүү',
  'бяслаг',
  'дэгэл',
  'аарц',
  'тараг',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Brand accent for the herder vertical — distinct from the primary orange. */
export const HERDER_BRAND = '#059669';
