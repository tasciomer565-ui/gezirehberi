// Özel isimlere kesme işaretiyle Türkçe hal eki (Ankara'dan, Kars'tan,
// İzmir'e, Rize'ye). Büyük ünlü uyumu son ünlüye, ünsüz benzeşmesi
// (-dan → -tan) son harfin sert ünsüz olmasına bakar.
const BACK_VOWELS = "aıou";
const VOWELS = "aıoueiöü";
const HARD_CONSONANTS = "çfhkpsşt";

function lastVowel(word: string): string {
  const w = word.toLocaleLowerCase("tr");
  for (let i = w.length - 1; i >= 0; i--) if (VOWELS.includes(w[i])) return w[i];
  return "e";
}

function lastLetter(word: string): string {
  const w = word.toLocaleLowerCase("tr");
  return w[w.length - 1] ?? "";
}

// -den/-dan/-ten/-tan
export function ablative(name: string): string {
  const back = BACK_VOWELS.includes(lastVowel(name));
  const hard = HARD_CONSONANTS.includes(lastLetter(name));
  return `${name}'${hard ? "t" : "d"}${back ? "a" : "e"}n`;
}

// -e/-a/-ye/-ya
export function dative(name: string): string {
  const back = BACK_VOWELS.includes(lastVowel(name));
  const endsWithVowel = VOWELS.includes(lastLetter(name));
  return `${name}'${endsWithVowel ? "y" : ""}${back ? "a" : "e"}`;
}
