export const GREETINGS = [
  'Wah, lama tidak bertemu! Bagaimana kabarmu?',
  'Senang sekali akhirnya kita bisa bertemu lagi!',
  'Apa kabar? Aku merindukanmu, loh.',
  'Akhirnya kita bertemu juga! Sudah lama menantikan momen ini.',
  'Hai! Bagaimana hari-harimu belakangan ini?',
  'Kamu kelihatan lebih segar dari terakhir kali kita bertemu!',
  'Sudah lama ya tidak bertatap muka langsung. Kabar baik kan?',
  'Sungguh menyenangkan melihat senyuman itu lagi!',
  'Lama tidak jumpa, apa ada cerita baru darimu?',
  'Aku sangat gembira bisa melihatmu kembali!',
  'Alhamdulillah, kita dipertemukan lagi dalam keadaan sehat.',
  'Wow, rasanya seperti bertemu saudara yang sudah lama pergi!',
  'Apa kabar terbaru dari hidupmu? Pasti banyak hal seru!',
  'Senang banget bisa ngobrol dan tertawa bersamamu lagi.',
  'Kita harus lebih sering bertemu begini, aku selalu merasa nyaman bersamamu.',
  'Bagaimana kabar keluargamu? Semoga semua dalam keadaan baik-baik saja.',
  'Rasanya seperti waktu berhenti saat kita akhirnya bertemu lagi.',
  'Lihat kamu, tetap sama seperti dulu—penuh semangat!',
  'Jadi, bagaimana pengalamanmu selama kita tak bertemu?',
  'Setiap kali bertemu denganmu, suasana jadi lebih hangat!',
  'Senyummu hari ini secerah mentari pagi, menenangkan sekali.',
  'Eh, kamu makin hari makin menawan saja. Ada yang baru nih?',
  'Kehadiranmu selalu membuat hariku lebih berwarna.',
  'Seperti secangkir kopi di pagi hari, kamu selalu bikin semangat!',
  'Hari ini kamu terlihat bahagia, semoga kebahagiaanmu menular ke yang lain ya.',
  'Mata yang berbinar itu, pasti ada cerita seru yang mau dibagi.',
  'Kalau ada yang bilang kamu berubah, iya... makin memesona!',
  'Duh, senyummu itu loh... bikin hari-hari jadi lebih indah.',
  'Kamu tahu nggak? Setiap bertemu denganmu selalu ada kupu-kupu di perutku.',
  'Seperti pelangi setelah hujan, kehadiranmu selalu ditunggu-tunggu.',
  'Hari ini kamu tampak istimewa, seperti biasanya sih.',
  'Ada yang berbeda nih, auramu makin bersinar aja!',
  'Ketika bertemu denganmu, waktu serasa berhenti sejenak.',
  'Semoga harimu seindah senyuman yang kamu berikan pada dunia.',
  'Kamu tahu? Tawamu itu seperti melodi yang menenangkan hati.',
  'Setiap kali melihatmu, aku selalu teringat betapa indahnya dunia ini.',
  'Kehadiranmu seperti hadiah terindah di setiap hariku.',
  'Berjumpa denganmu selalu membuat hatiku berbunga-bunga.',
  'Kamu itu seperti bintang, selalu bersinar di setiap keadaan.',
  'Melihatmu bahagia adalah kebahagiaan tersendiri untukku.'
];

export const getRandomGreeting = (): string => {
  const randomIndex = Math.floor(Math.random() * GREETINGS.length);
  return GREETINGS[randomIndex];
};

export default {
  GREETINGS,
  getRandomGreeting
}; 