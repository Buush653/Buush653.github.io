function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function checkLoveCompatibility(name1, name2) {
  return getRandomInt(0, 100);
}

export function getSavedResult(key) {
  const results = JSON.parse(localStorage.getItem('loveResults'));
  return results?.[key];
}

export function saveResult(key, result) {
  const results = JSON.parse(localStorage.getItem('loveResults') || '{}');
  results[key] = result;
  localStorage.setItem('loveResults', JSON.stringify(results));
}

export function clearSavedResult(key) {
  const results = JSON.parse(localStorage.getItem('loveResults') || '{}');
  delete results[key];
  localStorage.setItem('loveResults', JSON.stringify(results));
}

export function clearSavedResults() {
  localStorage.setItem('loveResults', '{}');
}

export function saveHistory(names, result) {
  const history = JSON.parse(localStorage.getItem('loveHistory') || '[]');
  const newEntry = {
    names: names.sort(),
    result: result,
    date: new Date().toLocaleString()
  };
  
  history.unshift(newEntry);
  
  // Keep only last 100 entries
  if (history.length > 100) {
    history.pop();
  }
  
  localStorage.setItem('loveHistory', JSON.stringify(history));
}

export function getHistory() {
  return JSON.parse(localStorage.getItem('loveHistory') || '[]');
}