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
        else resolve(rows || []);
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
  try {
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
      console.log('Default restaurants added');
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
      console.log('Default categories added');
    }

    // Проверка администратора
    const adminCount = await dbUtils.get('SELECT COUNT(*) as count FROM admin_credentials');
    if (adminCount.count === 0) {
      await dbUtils.run(
        'INSERT INTO admin_credentials (username, password) VALUES (?, ?)',
        ['admin', 'admin']
      );
      console.log('Default admin account created: admin/admin');
    }
    
    // Проверка настроек
    const settingsCount = await dbUtils.get('SELECT COUNT(*) as count FROM settings');
    if (settingsCount.count === 0) {
      await dbUtils.run(
        'INSERT INTO settings (siteTitle, contactEmail, contactPhone) VALUES (?, ?, ?)',
        ['FOOD MENU', 'info@foodmenu.com', '+7 (123) 456-78-90']
      );
      console.log('Default settings added');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

// Маршруты API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await dbUtils.all('SELECT * FROM restaurants');
    res.json(restaurants || []);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbUtils.all('SELECT * FROM categories');
    res.json(categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
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

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    const products = await dbUtils.all(query, params);
    
    // Convert restaurantIds from string to array if needed
    const formattedProducts = products.map(product => {
      if (product.restaurantIds && typeof product.restaurantIds === 'string') {
        try {
          // Try to parse if it's a JSON array
          product.restaurantIds = JSON.parse(product.restaurantIds);
        } catch (e) {
          // Otherwise split by comma
          product.restaurantIds = product.restaurantIds.split(',').map(id => id.trim());
        }
      } else if (!product.restaurantIds) {
        product.restaurantIds = [];
      }
      return product;
    });
    
    res.json(formattedProducts || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.warn('Login failed: missing credentials');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await dbUtils.get(
      'SELECT * FROM admin_credentials WHERE username = ? AND password = ?', 
      [username, password]
    );
    
    console.log('User found:', !!user);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      console.log('Login successful, token generated');
      res.json({ success: true, token });
    } else {
      console.warn('Login failed: invalid credentials');
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD операции для ресторанов
app.post('/api/restaurants', async (req, res) => {
  try {
    const restaurant = req.body;
    await dbUtils.run(
      'INSERT INTO restaurants (id, name, address, hours, phone, email, icon, deliveryTime, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [restaurant.id, restaurant.name, restaurant.address, restaurant.hours, restaurant.phone, restaurant.email, restaurant.icon, restaurant.deliveryTime, restaurant.isActive ? 1 : 0]
    );
    res.json({ success: true, id: restaurant.id });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = req.body;
    await dbUtils.run(
      'UPDATE restaurants SET name = ?, address = ?, hours = ?, phone = ?, email = ?, icon = ?, deliveryTime = ?, isActive = ? WHERE id = ?',
      [restaurant.name, restaurant.address, restaurant.hours, restaurant.phone, restaurant.email, restaurant.icon, restaurant.deliveryTime, restaurant.isActive ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbUtils.run('DELETE FROM restaurants WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD операции для категорий
app.post('/api/categories', async (req, res) => {
  try {
    const category = req.body;
    await dbUtils.run(
      'INSERT INTO categories (id, name, slug, isActive) VALUES (?, ?, ?, ?)',
      [category.id, category.name, category.slug, category.isActive ? 1 : 0]
    );
    res.json({ success: true, id: category.id });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = req.body;
    await dbUtils.run(
      'UPDATE categories SET name = ?, slug = ?, isActive = ? WHERE id = ?',
      [category.name, category.slug, category.isActive ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbUtils.run('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD операции для продуктов
app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    // Convert restaurantIds array to string if needed
    const restaurantIds = Array.isArray(product.restaurantIds) 
      ? JSON.stringify(product.restaurantIds) 
      : product.restaurantIds;
      
    await dbUtils.run(
      'INSERT INTO products (id, name, category, price, description, image, restaurantIds, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [product.id, product.name, product.category, product.price, product.description, product.image, restaurantIds, product.isActive ? 1 : 0]
    );
    res.json({ success: true, id: product.id });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    // Convert restaurantIds array to string if needed
    const restaurantIds = Array.isArray(product.restaurantIds) 
      ? JSON.stringify(product.restaurantIds) 
      : product.restaurantIds;
      
    await dbUtils.run(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, image = ?, restaurantIds = ?, isActive = ? WHERE id = ?',
      [product.name, product.category, product.price, product.description, product.image, restaurantIds, product.isActive ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbUtils.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD операции для заказов
app.get('/api/orders', async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];
    
    if (restaurantId || status) {
      query += ' WHERE';
      
      if (restaurantId) {
        query += ' restaurantId = ?';
        params.push(restaurantId);
      }
      
      if (status) {
        if (restaurantId) query += ' AND';
        query += ' status = ?';
        params.push(status);
      }
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const orders = await dbUtils.all(query, params);
    
    // Parse items from JSON string to array
    const formattedOrders = orders.map(order => {
      if (order.items && typeof order.items === 'string') {
        try {
          order.items = JSON.parse(order.items);
        } catch (e) {
          order.items = [];
        }
      }
      return order;
    });
    
    res.json(formattedOrders || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await dbUtils.get('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Parse items from JSON string to array
    if (order.items && typeof order.items === 'string') {
      try {
        order.items = JSON.parse(order.items);
      } catch (e) {
        order.items = [];
      }
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    const id = order.id || `order-${Date.now()}`;
    
    // Convert items array to JSON string if needed
    const items = Array.isArray(order.items) 
      ? JSON.stringify(order.items) 
      : order.items;
      
    await dbUtils.run(
      'INSERT INTO orders (id, customerName, restaurantId, items, totalAmount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, order.customerName, order.restaurantId, items, order.totalAmount, order.status || 'new', order.createdAt || new Date().toISOString()]
    );
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = req.body;
    
    // If only updating status
    if (Object.keys(order).length === 1 && order.status) {
      await dbUtils.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [order.status, id]
      );
    } else {
      // Convert items array to JSON string if needed
      const items = Array.isArray(order.items) 
        ? JSON.stringify(order.items) 
        : order.items;
        
      await dbUtils.run(
        'UPDATE orders SET customerName = ?, restaurantId = ?, items = ?, totalAmount = ?, status = ? WHERE id = ?',
        [order.customerName, order.restaurantId, items, order.totalAmount, order.status, id]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbUtils.run('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Настройки сайта
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await dbUtils.get('SELECT * FROM settings LIMIT 1');
    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    // Check if settings exist
    const existingSettings = await dbUtils.get('SELECT COUNT(*) as count FROM settings');
    
    if (existingSettings.count > 0) {
      // Update existing settings
      await dbUtils.run(
        'UPDATE settings SET siteTitle = ?, contactEmail = ?, contactPhone = ?, telegramBotEnabled = ?, telegramBotToken = ?, telegramChatId = ?',
        [settings.siteTitle, settings.contactEmail, settings.contactPhone, settings.telegramBotEnabled ? 1 : 0, settings.telegramBotToken, settings.telegramChatId]
      );
    } else {
      // Insert new settings
      await dbUtils.run(
        'INSERT INTO settings (siteTitle, contactEmail, contactPhone, telegramBotEnabled, telegramBotToken, telegramChatId) VALUES (?, ?, ?, ?, ?, ?)',
        [settings.siteTitle, settings.contactEmail, settings.contactPhone, settings.telegramBotEnabled ? 1 : 0, settings.telegramBotToken, settings.telegramChatId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin credentials
app.get('/api/admin/credentials', async (req, res) => {
  try {
    const credentials = await dbUtils.get('SELECT username FROM admin_credentials LIMIT 1');
    res.json(credentials || { username: 'admin' });
  } catch (error) {
    console.error('Error fetching admin credentials:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/credentials', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if credentials exist
    const existingCredentials = await dbUtils.get('SELECT username FROM admin_credentials LIMIT 1');
    
    if (existingCredentials) {
      // Update existing credentials
      await dbUtils.run(
        'UPDATE admin_credentials SET username = ?, password = ? WHERE username = ?',
        [username, password, existingCredentials.username]
      );
    } else {
      // Insert new credentials
      await dbUtils.run(
        'INSERT INTO admin_credentials (username, password) VALUES (?, ?)',
        [username, password]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    res.status(500).json({ error: error.message });
  }
});

// Telegram notifications
app.post('/api/telegram/notify', async (req, res) => {
  try {
    const { botToken, chatId, message } = req.body;
    
    if (!botToken || !chatId || !message) {
      return res.status(400).json({ error: 'botToken, chatId and message are required' });
    }
    
    console.log('Telegram notification would be sent here:', { botToken, chatId, message });
    // В реальном проекте здесь был бы код для отправки уведомления через Telegram API
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending telegram notification:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/telegram/order-notification', async (req, res) => {
  try {
    const order = req.body;
    
    // Get settings to check if Telegram is enabled
    const settings = await dbUtils.get('SELECT telegramBotEnabled, telegramBotToken, telegramChatId FROM settings LIMIT 1');
    
    if (!settings || !settings.telegramBotEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
      return res.json({ success: false, message: 'Telegram notifications not configured' });
    }
    
    // Get restaurant info
    const restaurant = await dbUtils.get('SELECT name FROM restaurants WHERE id = ?', [order.restaurantId]);
    
    // Prepare notification message
    const message = `
🔔 New Order Received!
Order ID: ${order.id}
Customer: ${order.customerName}
Restaurant: ${restaurant ? restaurant.name : 'Unknown'}
Amount: ${order.totalAmount}₽
Status: ${order.status || 'new'}
Date: ${new Date(order.createdAt).toLocaleString()}
Items: ${order.items.length} item(s)
`;
    
    console.log('Telegram order notification would be sent here:', message);
    // В реальном проекте здесь был бы код для отправки уведомления через Telegram API
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending order notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обработчик загрузки файлов
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path.replace('public/', ''); // Путь для доступа из браузера
    res.json({ success: true, path: filePath });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Статические файлы и SPA-маршрут
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  
  try {
    // Инициализация базы данных
    await initDatabase();
    console.log('Database initialized');
    
    // Добавление начальных данных
    await seedInitialData();
    console.log('Initial data seeded');
  } catch (error) {
    console.error('Error during startup:', error);
  }
});
