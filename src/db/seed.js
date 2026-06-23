require('dotenv').config();
const db = require('./index');

// Картинки — локальные файлы в public/images/products/<slug>.jpg
const img = (slug) => `/images/products/${slug}.jpg`;

const categories = [
  { name: 'Зелёный чай', slug: 'green' },
  { name: 'Чёрный чай', slug: 'black' },
  { name: 'Улун', slug: 'oolong' },
  { name: 'Пуэр', slug: 'puer' },
  { name: 'Белый чай', slug: 'white' },
  { name: 'Травяной чай', slug: 'herbal' },
];

const products = [
  // green
  { cat: 'green', name: 'Сенча Премиум', slug: 'sencha-premium', price: 690, stock: 120,
    desc: 'Классический японский зелёный чай с насыщенным травянистым вкусом и свежим ароматом моря.', kw: 'green,tea', lock: 11 },
  { cat: 'green', name: 'Лун Цзин (Колодец дракона)', slug: 'long-jing', price: 1290, stock: 60,
    desc: 'Знаменитый китайский чай из Ханчжоу. Плоские изумрудные листья, мягкий ореховый вкус.', kw: 'green,tea,leaves', lock: 12 },
  { cat: 'green', name: 'Матча церемониальная', slug: 'matcha', price: 1890, stock: 40,
    desc: 'Каменно-молотый порошковый чай высшего сорта. Яркий цвет, плотная пенка, умами-вкус.', kw: 'matcha', lock: 13 },
  { cat: 'green', name: 'Би Ло Чунь', slug: 'bi-luo-chun', price: 1150, stock: 55,
    desc: 'Скрученные в спираль почки с фруктово-цветочным ароматом. Один из десяти знаменитых чаёв Китая.', kw: 'green,tea,cup', lock: 14 },

  // black
  { cat: 'black', name: 'Дарджилинг First Flush', slug: 'darjeeling-first-flush', price: 980, stock: 80,
    desc: 'Индийское «чайное шампанское» первого сбора. Светлый настой, мускатные и цветочные ноты.', kw: 'black,tea', lock: 21 },
  { cat: 'black', name: 'Ассам TGFOP', slug: 'assam-tgfop', price: 590, stock: 150,
    desc: 'Крепкий солодовый чай с насыщенным медным настоем. Идеален с молоком по утрам.', kw: 'black,tea,cup', lock: 22 },
  { cat: 'black', name: 'Эрл Грей с бергамотом', slug: 'earl-grey', price: 650, stock: 130,
    desc: 'Классическая английская смесь чёрного чая с натуральным маслом бергамота.', kw: 'tea,bergamot', lock: 23 },
  { cat: 'black', name: 'Лапсанг Сушонг', slug: 'lapsang-souchong', price: 870, stock: 45,
    desc: 'Копчёный над сосновыми дровами чай с дымным, смолистым и плотным характером.', kw: 'black,tea,smoke', lock: 24 },

  // oolong
  { cat: 'oolong', name: 'Те Гуань Инь', slug: 'tie-guan-yin', price: 1090, stock: 70,
    desc: 'Бирюзовый улун с цветочно-сливочным ароматом и долгим сладким послевкусием.', kw: 'oolong,tea', lock: 31 },
  { cat: 'oolong', name: 'Да Хун Пао (Большой красный халат)', slug: 'da-hong-pao', price: 1750, stock: 35,
    desc: 'Знаменитый утёсный улун с гор Уишань. Минеральный, обжаренный, с медовыми нотами.', kw: 'tea,leaves', lock: 32 },
  { cat: 'oolong', name: 'Молочный улун', slug: 'milk-oolong', price: 920, stock: 90,
    desc: 'Нежный улун с естественным сливочно-молочным ароматом и мягким вкусом.', kw: 'oolong,milk,tea', lock: 33 },

  // puer
  { cat: 'puer', name: 'Шу Пуэр выдержанный', slug: 'shu-puer', price: 1340, stock: 50,
    desc: 'Тёмный ферментированный пуэр с земляным вкусом, нотами чернослива и древесины.', kw: 'puer,tea', lock: 41 },
  { cat: 'puer', name: 'Шэн Пуэр 2015', slug: 'sheng-puer-2015', price: 1980, stock: 25,
    desc: 'Зелёный пуэр прессованный в блин. Терпкий, с фруктовой кислинкой и табачными нотами.', kw: 'tea,cake', lock: 42 },
  { cat: 'puer', name: 'Пуэр в мандарине', slug: 'puer-mandarin', price: 760, stock: 65,
    desc: 'Шу пуэр, выдержанный внутри высушенного мандарина. Цитрусово-землистый купаж.', kw: 'mandarin,tea', lock: 43 },

  // white
  { cat: 'white', name: 'Бай Хао Инь Чжэнь (Серебряные иглы)', slug: 'bai-hao-yin-zhen', price: 1650, stock: 30,
    desc: 'Элитный белый чай из одних почек, покрытых серебристым пушком. Нежный, сладкий, медовый.', kw: 'white,tea', lock: 51 },
  { cat: 'white', name: 'Бай Му Дань (Белый пион)', slug: 'bai-mu-dan', price: 890, stock: 60,
    desc: 'Белый чай из почек и молодых листьев. Лёгкий настой с ароматом полевых цветов.', kw: 'white,tea,flower', lock: 52 },

  // herbal
  { cat: 'herbal', name: 'Каркаде (Гибискус)', slug: 'karkade', price: 420, stock: 200,
    desc: 'Ярко-красный напиток из лепестков суданской розы. Кисловатый, освежающий, богат витамином C.', kw: 'hibiscus,tea', lock: 61 },
  { cat: 'herbal', name: 'Ройбуш ванильный', slug: 'rooibos-vanilla', price: 560, stock: 110,
    desc: 'Южноафриканский травяной чай без кофеина с тёплым ванильным ароматом.', kw: 'rooibos,tea', lock: 62 },
  { cat: 'herbal', name: 'Иван-чай ферментированный', slug: 'ivan-chay', price: 480, stock: 140,
    desc: 'Русский кипрейный чай ручной ферментации. Медово-травяной вкус, без кофеина.', kw: 'herbal,tea', lock: 63 },
];

async function seed() {
  // categories
  const catIds = {};
  for (const c of categories) {
    const { rows } = await db.query(
      `INSERT INTO categories (name, slug) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [c.name, c.slug]
    );
    catIds[c.slug] = rows[0].id;
  }
  console.log(`Categories: ${Object.keys(catIds).length}`);

  // products
  let count = 0;
  for (const p of products) {
    await db.query(
      `INSERT INTO products (name, slug, description, price, stock, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name, description = EXCLUDED.description,
           price = EXCLUDED.price, stock = EXCLUDED.stock,
           category_id = EXCLUDED.category_id, image_url = EXCLUDED.image_url`,
      [p.name, p.slug, p.desc, p.price, p.stock, catIds[p.cat], img(p.slug)]
    );
    count++;
  }
  console.log(`Products: ${count}`);
  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
