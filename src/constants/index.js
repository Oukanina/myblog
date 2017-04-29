/* eslint-disable no-useless-escape */

export const DEFAULT_BACKGROUND_COLOR = '#232323';

export const SPACE = ' ';
export const AT = '@';
export const TILDE = '~';
export const COLON = ':';
export const DOLLAR = '$';

export const CHARACTERREX = /^[0-9|a-zA-Z|%|\^|\&|\*|(|)|\!|#|\$|,|\.|\?|@]$/;
export const SPECIALKEY = /Backspace|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Shift|Control|Alt|Escape|Meta|CapsLock|Tab|/;

export const KEYMAP = {
  ENTER: 13,
  ALT: 18,
  SHIFT: 16,
  CTRL: 17,
  BACKSPACE: 8,
  SPACE: 32,
  ESC: 27,
  TAB: 9,
  DOWN: 40,
  UP: 38,
  LEFT: 37,
  RIGHT: 39,
  END: 35,
  HOME: 3,
};

export const UPLOAD_STATUS = {
  VERIFICATION: 'VERIFICATION',
  UPLOAD_FILE_DATA: 'UPLOAD_FILE_DATA',
  UPLOAD_FILE_INFO: 'UPLOAD_FILE_INFO',
};
