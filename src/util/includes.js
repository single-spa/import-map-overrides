export function includes(obj, item) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] === item) {
        return true;
      }
    }
    return false;
  } else if (typeof obj === "string") {
    return obj.indexOf(item) >= 0;
  } else {
    throw Error(`Can't call includes on ${typeof obj}`);
  }
}
