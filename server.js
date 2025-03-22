const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const db = new sqlite3.Database('./foodmenu.db');

// Middleware
app.use(bodyParser.json({limit: '10mb'}));
app.use(express.static('public'));

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Инициализация базы данных
db.serialize(() => {
  // Рестораны
  db.run(`CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    hours TEXT,
    icon TEXT,
    deliveryTime TEXT,
    isActive INTEGER DEFAULT 1
  )`);

  // Продукты
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    price REAL,
    description TEXT,
    image TEXT,
    restaurantIds TEXT,
    isActive INTEGER DEFAULT 1
  )`);

  // Категории
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    slug TEXT,
    isActive INTEGER DEFAULT 1
  )`);

  // Заказы
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT,
    restaurantId TEXT,
    items TEXT,
    totalAmount REAL,
    status TEXT DEFAULT 'new',
    createdAt TEXT
  )`);

  // Настройки
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    siteTitle TEXT,
    contactEmail TEXT,
    contactPhone TEXT,
    telegramBotEnabled INTEGER,
    telegramBotToken TEXT,
    telegramChatId TEXT
  )`);

  // Аутентификация
  db.run(`CREATE TABLE IF NOT EXISTS admin_credentials (
    username TEXT PRIMARY KEY,
    password TEXT
  )`);
});

// Утилиты для работы с БД
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Инициализация начальных данных
async function initializeData() {
  try {
    // Проверка и заполнение ресторанов
    const restaurantsCount = await getQuery('SELECT COUNT(*) as count FROM restaurants');
    if (restaurantsCount.count === 0) {
      const defaultRestaurants = [
        {
          id: 'central',
          name: 'Food Menu Central',
          address: '15 Tverskaya St., Moscow, 123056',
          hours: 'Mon-Fri: 10:00 - 22:00, Sat-Sun: 11:00 - 23:00',
          phone: '+7 (495) 123-45-67',
          email: 'central@foodmenu.com',
          icon: 'images/restaurant-icons/central.png',
          deliveryTime: '25',
          isActive: 1
        },
        {
          id: 'west',
          name: 'Food Menu West',
          address: '30 Kutuzovsky Ave., Moscow, 121165',
          hours: 'Mon-Sun: 09:00 - 22:00',
          phone: '+7 (495) 987-65-43',
          email: 'west@foodmenu.com',
          icon: 'images/restaurant-icons/central.png',
          deliveryTime: '25',
          isActive: 1
        },
        {
          id: 'north',
          name: 'Food Menu North',
          address: '163A Dmitrovskoye Hwy., Moscow, 127280',
          hours: 'Mon-Fri: 10:00 - 21:00, Sat-Sun: 11:00 - 22:00',
          phone: '+7 (495) 111-22-33',
          email: 'north@foodmenu.com',
          icon: 'images/restaurant-icons/central.png',
          deliveryTime: '25',
          isActive: 1
        }
      ];

      for (const restaurant of defaultRestaurants) {
        await runQuery(
          'INSERT INTO restaurants (id, name, address, hours, phone, email, icon, deliveryTime, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [restaurant.id, restaurant.name, restaurant.address, restaurant.hours, restaurant.phone, restaurant.email, restaurant.icon, restaurant.deliveryTime, restaurant.isActive]
        );
      }
    }

    // Проверка и заполнение категорий
    const categoriesCount = await getQuery('SELECT COUNT(*) as count FROM categories');
    if (categoriesCount.count === 0) {
      const defaultCategories = [
        { id: 'all', name: 'All', slug: 'all', isActive: 1 },
        { id: 'burgers', name: 'Burgers', slug: 'burgers', isActive: 1 },
        { id: 'coffee', name: 'Coffee', slug: 'coffee', isActive: 1 },
        { id: 'pasta', name: 'Pasta', slug: 'pasta', isActive: 1 },
        { id: 'soup', name: 'Soups', slug: 'soup', isActive: 1 },
        { id: 'pizza', name: 'Pizza', slug: 'pizza', isActive: 1 },
        { id: 'dessert', name: 'Desserts', slug: 'dessert', isActive: 1 }
      ];

      for (const category of defaultCategories) {
        await runQuery(
          'INSERT INTO categories (id, name, slug, isActive) VALUES (?, ?, ?, ?)',
          [category.id, category.name, category.slug, category.isActive]
        );
      }
    }

    // Проверка и заполнение продуктов
    const productsCount = await getQuery('SELECT COUNT(*) as count FROM products');
    if (productsCount.count === 0) {
      const defaultProducts = [
        // Central restaurant
        {
          id: 'burger-classic',
          name: 'CLASSIC BURGER',
          category: 'burgers',
          price: 450,
          description: 'Juicy beef patty, signature sauce, fresh vegetables, and a crispy bun. The perfect combination of ingredients for true burger lovers.',
          image: 'burger.jpg',
          restaurantIds: JSON.stringify(['central']),
          isActive: 1
        },
        // ... (остальные продукты) ...
      ];

      for (const product of defaultProducts) {
        await runQuery(
          'INSERT INTO products (id, name, category, price, description, image, restaurantIds, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [product.id, product.name, product.category, product.price, product.description, product.image, product.restaurantIds, product.isActive]
        );
      }
    }

    // Проверка и заполнение настроек
    const settingsCount = await getQuery('SELECT COUNT(*) as count FROM settings');
    if (settingsCount.count === 0) {
      await runQuery(
        'INSERT INTO settings (siteTitle, contactEmail, contactPhone, telegramBotEnabled) VALUES (?, ?, ?, ?)',
        ['FOOD MENU', 'info@foodmenu.com', '+7 (123) 456-78-90', 0]
      );
    }

    // Проверка и установка учетных данных администратора
    const credentialsCount = await getQuery('SELECT COUNT(*) as count FROM admin_credentials');
    if (credentialsCount.count === 0) {
      await runQuery(
        'INSERT INTO admin_credentials (username, password) VALUES (?, ?)',
        ['admin', 'admin']
      );
    }
  } catch (error) {
    console.error('Ошибка инициализации данных:', error);
  }
}

// Маршруты для ресторанов
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await allQuery('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/restaurants', async (req, res) => {
  try {
    const { name, address, phone, email, hours, icon, deliveryTime, isActive = 1 } = req.body;
    const id = crypto.randomBytes(8).toString('hex');

    await runQuery(
      'INSERT INTO restaurants (id, name, address, phone, email, hours, icon, deliveryTime, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, address, phone, email, hours, icon, deliveryTime, isActive]
    );

    res.status(201).json({ id, message: 'Restaurant added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Маршруты для продуктов
app.get('/api/products', async (req, res) => {
  try {
    const { restaurantId, category } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (restaurantId) {
      query += ' AND json_extract(restaurantIds, "$") LIKE ?';
      params.push(`%${restaurantId}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    const products = await allQuery(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Маршруты для категорий
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await allQuery('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Маршруты для заказов
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await allQuery('SELECT * FROM orders ORDER BY createdAt DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, restaurantId, items, totalAmount } = req.body;
    const id = crypto.randomBytes(8).toString('hex');

    await runQuery(
      'INSERT INTO orders (id, customerName, restaurantId, items, totalAmount, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, customerName, restaurantId, JSON.stringify(items), totalAmount, new Date().toISOString(), 'new']
    );

    res.status(201).json({ id, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Маршруты для настроек
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getQuery('SELECT * FROM settings LIMIT 1');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Маршруты для аутентификации
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await getQuery('SELECT * FROM admin_credentials WHERE username = ? AND password = ?', [username, password]);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обработка загрузки файлов
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    filename: req.file.filename,
    path: `/images/${req.file.filename}` 
  });
});

// Статические файлы
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  await initializeData();
});