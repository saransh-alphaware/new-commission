export function cleanAndFormatInput(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanAndFormatInputNoSpace(value) {
  return value.replace(/\s+/g, "").trim();
}

export function cleanAndFormatInputNoSpecialChar(value) {
  return value.replace(/[^A-Z0-9. ]/gi, ""); 
}
