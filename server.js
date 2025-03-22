const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const database = new sqlite3.Database('./foodmenu.db');

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

// Утилиты для работы с БД
const dbUtils = {
  run: (query, params = []) => {
    return new Promise((resolve, reject) => {
      database.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },

  all: (query, params = []) => {
    return new Promise((resolve, reject) => {
      database.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  get: (query, params = []) => {
    return new Promise((resolve, reject) => {
      database.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Инициализация базы данных
const initDatabase = async () => {
  await dbUtils.run(`CREATE TABLE IF NOT EXISTS restaurants (
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

  await dbUtils.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    price REAL,
    description TEXT,
    image TEXT,
    restaurantIds TEXT,
    isActive INTEGER DEFAULT 1
  )`);

  await dbUtils.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    slug TEXT,
    isActive INTEGER DEFAULT 1
  )`);

  await dbUtils.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT,
    restaurantId TEXT,
    items TEXT,
    totalAmount REAL,
    status TEXT DEFAULT 'new',
    createdAt TEXT
  )`);

  await dbUtils.run(`CREATE TABLE IF NOT EXISTS settings (
    siteTitle TEXT,
    contactEmail TEXT,
    contactPhone TEXT,
    telegramBotEnabled INTEGER,
    telegramBotToken TEXT,
    telegramChatId TEXT
  )`);

  await dbUtils.run(`CREATE TABLE IF NOT EXISTS admin_credentials (
    username TEXT PRIMARY KEY,
    password TEXT
  )`);
};

// Начальные данные
const seedInitialData = async () => {
  // Проверка ресторанов
  const restaurantsCount = await dbUtils.get('SELECT COUNT(*) as count FROM restaurants');
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
        icon: 'images/restaurant-icons/west.png',
        deliveryTime: '25',
        isActive: 1
      }
    ];

    for (const restaurant of defaultRestaurants) {
      await dbUtils.run(
        'INSERT INTO restaurants (id, name, address, hours, phone, email, icon, deliveryTime, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [restaurant.id, restaurant.name, restaurant.address, restaurant.hours, restaurant.phone, restaurant.email, restaurant.icon, restaurant.deliveryTime, restaurant.isActive]
      );
    }
  }

  // Проверка категорий
  const categoriesCount = await dbUtils.get('SELECT COUNT(*) as count FROM categories');
  if (categoriesCount.count === 0) {
    const defaultCategories = [
      { id: 'all', name: 'All', slug: 'all', isActive: 1 },
      { id: 'burgers', name: 'Burgers', slug: 'burgers', isActive: 1 },
      { id: 'coffee', name: 'Coffee', slug: 'coffee', isActive: 1 }
    ];

    for (const category of defaultCategories) {
      await dbUtils.run(
        'INSERT INTO categories (id, name, slug, isActive) VALUES (?, ?, ?, ?)',
        [category.id, category.name, category.slug, category.isActive]
      );
    }
  }

  // Проверка администратора
  const adminCount = await dbUtils.get('SELECT COUNT(*) as count FROM admin_credentials');
  if (adminCount.count === 0) {
    await dbUtils.run(
      'INSERT INTO admin_credentials (username, password) VALUES (?, ?)',
      ['admin', 'admin']
    );
  }
};

// Маршруты
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await dbUtils.all('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbUtils.all('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { restaurantId, category } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (restaurantId) {
      query += ' AND restaurantIds LIKE ?';
      params.push(`%${restaurantId}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    const products = await dbUtils.all(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dbUtils.get(
      'SELECT * FROM admin_credentials WHERE username = ? AND password = ?', 
      [username, password]
    );

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

// Статические файлы
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  
  // Инициализация базы данных
  await initDatabase();
  await seedInitialData();
});
