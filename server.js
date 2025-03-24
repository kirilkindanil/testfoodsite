const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Убедимся, что файл базы данных существует и содержит нужную структуру
const initDatabase = async () => {
  try {
    // Проверяем существует ли файл
    const exists = await fs.pathExists(DB_FILE);
    
    if (!exists) {
      // Если файл не существует, создаем его с начальной структурой
      const initialData = {
        restaurants: [
          {
            id: 'central',
            name: 'Food Menu Central',
            address: '15 Tverskaya St., Moscow, 123056',
            hours: 'Mon-Fri: 10:00 - 22:00, Sat-Sun: 11:00 - 23:00',
            phone: '+7 (495) 123-45-67',
            email: 'central@foodmenu.com',
            isActive: true,
            icon: 'images/restaurant-icons/central.png',
            deliveryTime: '25'
          },
          {
            id: 'west',
            name: 'Food Menu West',
            address: '30 Kutuzovsky Ave., Moscow, 121165',
            hours: 'Mon-Sun: 09:00 - 22:00',
            phone: '+7 (495) 987-65-43',
            email: 'west@foodmenu.com',
            isActive: true,
            icon: 'images/restaurant-icons/central.png',
            deliveryTime: '25'
          },
          {
            id: 'north',
            name: 'Food Menu North',
            address: '163A Dmitrovskoye Hwy., Moscow, 127280',
            hours: 'Mon-Fri: 10:00 - 21:00, Sat-Sun: 11:00 - 22:00',
            phone: '+7 (495) 111-22-33',
            email: 'north@foodmenu.com',
            isActive: true,
            icon: 'images/restaurant-icons/central.png',
            deliveryTime: '25'
          }
        ],
        categories: [
          { id: 'all', name: 'All', slug: 'all', isActive: true },
          { id: 'burgers', name: 'Burgers', slug: 'burgers', isActive: true },
          { id: 'coffee', name: 'Coffee', slug: 'coffee', isActive: true },
          { id: 'pasta', name: 'Pasta', slug: 'pasta', isActive: true },
          { id: 'soup', name: 'Soups', slug: 'soup', isActive: true },
          { id: 'pizza', name: 'Pizza', slug: 'pizza', isActive: true },
          { id: 'dessert', name: 'Desserts', slug: 'dessert', isActive: true }
        ],
        products: [
          {
            id: 'burger-classic',
            name: 'CLASSIC BURGER',
            category: 'burgers',
            price: 450,
            description: 'Juicy beef patty, signature sauce, fresh vegetables, and a crispy bun. The perfect combination of ingredients for true burger lovers.',
            image: 'burger.jpg',
            restaurantIds: ['central']
          },
          {
            id: 'coffee-premium',
            name: 'PREMIUM COFFEE',
            category: 'coffee',
            price: 250,
            description: 'Premium arabica, rich taste, velvety texture, and exquisite aftertaste. The ideal choice for true coffee connoisseurs.',
            image: 'coffee.jpg',
            restaurantIds: ['central']
          },
          {
            id: 'pasta-italian',
            name: 'ITALIAN PASTA',
            category: 'pasta',
            price: 480,
            description: 'Traditional pasta with fragrant sauce, fresh herbs, and parmesan. The authentic taste of Italy in every portion of our signature pasta.',
            image: 'pasta.jpg',
            restaurantIds: ['central']
          },
          {
            id: 'cheesecake',
            name: 'CHEESECAKE',
            category: 'dessert',
            price: 320,
            description: 'Delicate creamy cheesecake with a crunchy base, fresh berries, and vanilla sauce.',
            image: 'dessert.jpg',
            restaurantIds: ['central', 'west']
          },
          {
            id: 'burger-deluxe',
            name: 'DELUXE BURGER',
            category: 'burgers',
            price: 520,
            description: 'Signature burger with marbled beef, caramelized onions, fried bacon, and cheddar cheese on a brioche bun.',
            image: 'burger.jpg',
            restaurantIds: ['west']
          },
          {
            id: 'cappuccino',
            name: 'CAPPUCCINO',
            category: 'coffee',
            price: 220,
            description: 'Classic Italian cappuccino with rich espresso and delicate milk foam. Served with cinnamon upon request.',
            image: 'coffee.jpg',
            restaurantIds: ['west']
          }
        ],
        orders: [],
        settings: {
          siteTitle: 'FOOD MENU',
          contactEmail: 'info@foodmenu.com',
          contactPhone: '+7 (123) 456-78-90',
          telegramBotEnabled: false,
          telegramBotToken: '',
          telegramChatId: ''
        },
        adminCredentials: {
          username: 'admin',
          password: 'admin'
        }
      };
      
      await fs.writeJson(DB_FILE, initialData, { spaces: 2 });
      console.log('База данных инициализирована');
    }
  } catch (err) {
    console.error('Ошибка при инициализации базы данных:', err);
  }
};

// Вспомогательные функции для работы с БД
const readDatabase = async () => {
  try {
    return await fs.readJson(DB_FILE);
  } catch (err) {
    console.error('Ошибка чтения базы данных:', err);
    return { restaurants: [], categories: [], products: [], orders: [], settings: {}, adminCredentials: {} };
  }
};

const writeDatabase = async (data) => {
  try {
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
    return true;
  } catch (err) {
    console.error('Ошибка записи в базу данных:', err);
    return false;
  }
};

// Форматирование даты и времени
function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  return dateTime.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// API эндпоинты

// Авторизация
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await readDatabase();
    
    if (!db.adminCredentials) {
      db.adminCredentials = { username: 'admin', password: 'admin' };
      await writeDatabase(db);
    }
    
    if (db.adminCredentials.username === username && db.adminCredentials.password === password) {
      res.json({ success: true, token: 'admin-token-' + Date.now() });
    } else {
      res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Рестораны
app.get('/api/restaurants', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/restaurants/active', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.restaurants.filter(restaurant => restaurant.isActive));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const restaurant = db.restaurants.find(r => r.id === req.params.id);
    
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ error: 'Restaurant not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/restaurants', async (req, res) => {
  try {
    const db = await readDatabase();
    const newRestaurant = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };
    
    db.restaurants.push(newRestaurant);
    await writeDatabase(db);
    
    res.status(201).json(newRestaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const index = db.restaurants.findIndex(r => r.id === req.params.id);
    
    if (index !== -1) {
      db.restaurants[index] = { ...db.restaurants[index], ...req.body };
      await writeDatabase(db);
      res.json(db.restaurants[index]);
    } else {
      res.status(404).json({ error: 'Restaurant not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const initialLength = db.restaurants.length;
    db.restaurants = db.restaurants.filter(r => r.id !== req.params.id);
    
    if (db.restaurants.length !== initialLength) {
      await writeDatabase(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Restaurant not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Категории
app.get('/api/categories', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/active', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.categories.filter(category => category.isActive));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const category = db.categories.find(c => c.id === req.params.id);
    
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const db = await readDatabase();
    const newCategory = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };
    
    db.categories.push(newCategory);
    await writeDatabase(db);
    
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const index = db.categories.findIndex(c => c.id === req.params.id);
    
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...req.body };
      await writeDatabase(db);
      res.json(db.categories[index]);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const initialLength = db.categories.length;
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    
    if (db.categories.length !== initialLength) {
      await writeDatabase(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Продукты
app.get('/api/products', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const product = db.products.find(p => p.id === req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/restaurant/:restaurantId', async (req, res) => {
  try {
    const db = await readDatabase();
    const restaurantId = req.params.restaurantId;
    
    const products = db.products.filter(product => 
      product.restaurantIds && product.restaurantIds.includes(restaurantId)
    );
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const db = await readDatabase();
    const categoryId = req.params.categoryId;
    
    const products = db.products.filter(product => product.category === categoryId);
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const db = await readDatabase();
    const newProduct = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      restaurantIds: req.body.restaurantIds || []
    };
    
    db.products.push(newProduct);
    await writeDatabase(db);
    
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const index = db.products.findIndex(p => p.id === req.params.id);
    
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...req.body };
      await writeDatabase(db);
      res.json(db.products[index]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const initialLength = db.products.length;
    db.products = db.products.filter(p => p.id !== req.params.id);
    
    if (db.products.length !== initialLength) {
      await writeDatabase(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Заказы
app.get('/api/orders', async (req, res) => {
  try {
    const db = await readDatabase();
    // Сортируем заказы по дате создания (новые сверху)
    const sortedOrders = db.orders.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sortedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const order = db.orders.find(o => o.id === req.params.id);
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/restaurant/:restaurantId', async (req, res) => {
  try {
    const db = await readDatabase();
    const restaurantId = req.params.restaurantId;
    
    const orders = db.orders.filter(order => order.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const db = await readDatabase();
    const newOrder = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      status: req.body.status || 'new',
      createdAt: req.body.createdAt || new Date().toISOString()
    };
    
    db.orders.push(newOrder);
    await writeDatabase(db);
    
    // Отправка уведомления в Telegram
    if (db.settings.telegramBotEnabled && 
        db.settings.telegramBotToken && 
        db.settings.telegramChatId) {
      
      try {
        const restaurant = db.restaurants.find(r => r.id === newOrder.restaurantId) || { name: 'Unknown Restaurant' };
        const orderItems = newOrder.items.map(item => `• ${item.name} x${item.quantity} - ${item.price * item.quantity}₽`).join('\n');
        
        const message = `
<b>🔔 NEW ORDER #${newOrder.id}</b>

<b>Customer:</b> ${newOrder.customerName}
<b>Phone:</b> ${newOrder.customerPhone || 'Not provided'}
<b>Restaurant:</b> ${restaurant.name}
<b>Pickup Time:</b> ${newOrder.pickupTime || newOrder.deliveryTime || '30'} minutes
<b>Order Time:</b> ${formatDateTime(newOrder.createdAt)}
<b>Total Amount:</b> ${newOrder.totalAmount}₽

<b>Order Items:</b>
${orderItems}
        `.trim();
        
        // Здесь можно добавить код для отправки уведомления в Telegram
        console.log('Telegram notification: ', message);
      } catch (telegramError) {
        console.error('Error sending Telegram notification:', telegramError);
      }
    }
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const index = db.orders.findIndex(o => o.id === req.params.id);
    
    if (index !== -1) {
      db.orders[index] = { ...db.orders[index], ...req.body };
      await writeDatabase(db);
      res.json(db.orders[index]);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const initialLength = db.orders.length;
    db.orders = db.orders.filter(o => o.id !== req.params.id);
    
    if (db.orders.length !== initialLength) {
      await writeDatabase(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Настройки
app.get('/api/settings', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const db = await readDatabase();
    db.settings = { ...db.settings, ...req.body };
    await writeDatabase(db);
    res.json(db.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Статистика для админ-панели
app.get('/api/statistics/dashboard', async (req, res) => {
  try {
    const db = await readDatabase();
    const orders = db.orders;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Статистика по статусам заказов
    const orderStatusStats = {};
    orders.forEach(order => {
      orderStatusStats[order.status] = (orderStatusStats[order.status] || 0) + 1;
    });
    
    // Статистика по ресторанам
    const restaurantStats = {};
    orders.forEach(order => {
      restaurantStats[order.restaurantId] = (restaurantStats[order.restaurantId] || 0) + 1;
    });
    
    // Топ-5 популярных продуктов
    const productStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        productStats[item.productId] = (productStats[item.productId] || 0) + item.quantity;
      });
    });
    
    const topProducts = Object.entries(productStats)
      .map(([productId, quantity]) => {
        const product = db.products.find(p => p.id === productId);
        return { 
          id: productId, 
          name: product ? product.name : 'Unknown product', 
          quantity 
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    const stats = {
      restaurantCount: db.restaurants.length,
      productCount: db.products.length,
      orderCount: orders.length,
      totalRevenue,
      recentOrders: orders.slice(0, 5),
      orderStatusStats,
      restaurantStats,
      topProducts
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Входная точка приложения
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
});