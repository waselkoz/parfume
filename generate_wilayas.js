/* eslint-disable */
const fs = require('fs');
const data = {
  "body": [
    { "wilayaLabel": "Alger", "wilayaID": "16", "home": "400", "stopdesk": "250" },
    { "wilayaLabel": "Blida", "wilayaID": "9", "home": "600", "stopdesk": "300" },
    { "wilayaLabel": "Boumerdes", "wilayaID": "35", "home": "600", "stopdesk": "300" },
    { "wilayaLabel": "Tipaza", "wilayaID": "42", "home": "600", "stopdesk": "300" },
    { "wilayaLabel": "Bouira", "wilayaID": "10", "home": "630", "stopdesk": "300" },
    { "wilayaLabel": "Medea", "wilayaID": "26", "home": "630", "stopdesk": "300" },
    { "wilayaLabel": "Tizi Ouzou", "wilayaID": "15", "home": "630", "stopdesk": "300" },
    { "wilayaLabel": "Chlef", "wilayaID": "2", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Annaba", "wilayaID": "23", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Bordj Bou Arraridj", "wilayaID": "34", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Bejaia", "wilayaID": "6", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Skikda", "wilayaID": "21", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Oran", "wilayaID": "31", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Mila", "wilayaID": "43", "home": "720", "stopdesk": "0" },
    { "wilayaLabel": "Constantine", "wilayaID": "25", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Ain Temouchent", "wilayaID": "46", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Tlemcen", "wilayaID": "13", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Sidi bel Abbas", "wilayaID": "22", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Relizane", "wilayaID": "48", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "MSila", "wilayaID": "28", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Mascara", "wilayaID": "29", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Batna", "wilayaID": "5", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Ain Defla", "wilayaID": "44", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Tissemsilt", "wilayaID": "38", "home": "720", "stopdesk": "0" },
    { "wilayaLabel": "Setif", "wilayaID": "19", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Oum el Bouaghi", "wilayaID": "4", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Mostaganem", "wilayaID": "27", "home": "720", "stopdesk": "300" },
    { "wilayaLabel": "Jijel", "wilayaID": "18", "home": "770", "stopdesk": "300" },
    { "wilayaLabel": "Khenchela", "wilayaID": "40", "home": "810", "stopdesk": "300" },
    { "wilayaLabel": "Tiaret", "wilayaID": "14", "home": "810", "stopdesk": "300" },
    { "wilayaLabel": "Saida", "wilayaID": "20", "home": "810", "stopdesk": "300" },
    { "wilayaLabel": "Guelma", "wilayaID": "24", "home": "810", "stopdesk": "300" },
    { "wilayaLabel": "Souk Ahras", "wilayaID": "41", "home": "810", "stopdesk": "300" },
    { "wilayaLabel": "El Taref", "wilayaID": "36", "home": "810", "stopdesk": "0" },
    { "wilayaLabel": "Tebessa", "wilayaID": "12", "home": "810", "stopdesk": "300" },
    { "wilayaLabel": "Laghouat", "wilayaID": "3", "home": "900", "stopdesk": "430" },
    { "wilayaLabel": "Biskra", "wilayaID": "7", "home": "900", "stopdesk": "430" },
    { "wilayaLabel": "Djelfa", "wilayaID": "17", "home": "900", "stopdesk": "430" },
    { "wilayaLabel": "Ouled Djellal", "wilayaID": "51", "home": "900", "stopdesk": "0" },
    { "wilayaLabel": "El Meniaa", "wilayaID": "58", "home": "990", "stopdesk": "430" },
    { "wilayaLabel": "El Oued", "wilayaID": "39", "home": "990", "stopdesk": "0" },
    { "wilayaLabel": "Ouargla", "wilayaID": "30", "home": "990", "stopdesk": "430" },
    { "wilayaLabel": "Touggourt", "wilayaID": "55", "home": "990", "stopdesk": "430" },
    { "wilayaLabel": "El Mghair", "wilayaID": "57", "home": "990", "stopdesk": "0" },
    { "wilayaLabel": "Ghardaia", "wilayaID": "47", "home": "990", "stopdesk": "430" },
    { "wilayaLabel": "Bechar", "wilayaID": "8", "home": "1080", "stopdesk": "510" },
    { "wilayaLabel": "Naama", "wilayaID": "45", "home": "1080", "stopdesk": "510" },
    { "wilayaLabel": "Beni Abbas", "wilayaID": "52", "home": "1080", "stopdesk": "0" },
    { "wilayaLabel": "El Bayadh", "wilayaID": "32", "home": "1080", "stopdesk": "0" },
    { "wilayaLabel": "Tindouf", "wilayaID": "37", "home": "1350", "stopdesk": "0" },
    { "wilayaLabel": "Adrar", "wilayaID": "1", "home": "1350", "stopdesk": "600" },
    { "wilayaLabel": "Timimoune", "wilayaID": "49", "home": "1350", "stopdesk": "0" },
    { "wilayaLabel": "In Salah", "wilayaID": "53", "home": "1530", "stopdesk": "770" },
    { "wilayaLabel": "Tamanrasset", "wilayaID": "11", "home": "1620", "stopdesk": "850" },
    { "wilayaLabel": "Illizi", "wilayaID": "33", "home": "1800", "stopdesk": "850" }
  ]
};

const formatted = data.body.map(item => {
  const code = item.wilayaID.padStart(2, '0');
  const name = item.wilayaLabel.trim();
  const price = Number(item.home);
  const deskPrice = Number(item.stopdesk);
  return `  { code: "${code}", name: "${name}", price: ${price}, deskPrice: ${deskPrice} }`;
}).join(',\n');

fs.writeFileSync('new_wilayas.txt', 'const WILAYAS = [\n' + formatted + '\n];\n');
console.log('Done!');
