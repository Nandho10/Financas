const fs = require('fs');
const data = JSON.parse(fs.readFileSync('parsed_nubank.json', 'utf8'));

const expenses = [];
data.forEach(t => {
  if (t.description.toLowerCase().includes('pagamento em') || t.description.toLowerCase().includes('saldo restante')) return;
  let cleanValue = t.value.replace(/[^0-9,]/g, '').replace(',', '.');
  let amount = parseFloat(cleanValue);
  expenses.push({ desc: t.description, amount });
});

// find subsets that sum to 197.00 or 170.00
const target1 = 197.00;
const target2 = 170.00;

function findSubset(arr, target) {
  const result = [];
  function search(idx, currentSum, currentArr) {
    if (Math.abs(currentSum - target) < 0.01) {
      result.push([...currentArr]);
      return;
    }
    if (currentSum > target + 0.01) return;
    for (let i = idx; i < arr.length; i++) {
      search(i + 1, currentSum + arr[i].amount, [...currentArr, arr[i]]);
    }
  }
  search(0, 0, []);
  return result;
}

console.log('Subsets for 170.00:');
const s170 = findSubset(expenses, 170.00);
if (s170.length > 0) {
  s170.slice(0, 5).forEach(s => console.log(s));
} else console.log('none');

console.log('Subsets for 197.00:');
const s197 = findSubset(expenses, 197.00);
if (s197.length > 0) {
  s197.slice(0, 5).forEach(s => console.log(s));
} else console.log('none');

