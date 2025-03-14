// db.js - Единый файл для хранения данных и API-логики ресторанного приложения

// Инициализация локального хранилища, если оно пустое
if (!localStorage.getItem('restaurants')) {
  // Стандартные рестораны
  const defaultRestaurants = [
    {
      id: 'central',
      name: 'Food Menu Центральный',
      address: 'ул. Тверская, 15, Москва, 123056',
      hours: 'Пн-Пт: 10:00 - 22:00, Сб-Вс: 11:00 - 23:00',
      phone: '+7 (495) 123-45-67',
      email: 'central@foodmenu.com',
      isActive: true
    },
    {
      id: 'west',
      name: 'Food Menu Западный',
      address: 'Кутузовский пр-т, 30, Москва, 121165',
      hours: 'Пн-Вс: 09:00 - 22:00',
      phone: '+7 (495) 987-65-43',
      email: 'west@foodmenu.com',
      isActive: true
    },
    {
      id: 'north',
      name: 'Food Menu Северный',
      address: 'Дмитровское ш., 163А, Москва, 127280',
      hours: 'Пн-Пт: 10:00 - 21:00, Сб-Вс: 11:00 - 22:00',
      phone: '+7 (495) 111-22-33',
      email: 'north@foodmenu.com',
      isActive: true
    }
  ];
  localStorage.setItem('restaurants', JSON.stringify(defaultRestaurants));
}

if (!localStorage.getItem('categories')) {
  // Стандартные категории
  const defaultCategories = [
    { id: 'all', name: 'Все', slug: 'all', isActive: true },
    { id: 'burgers', name: 'Бургеры', slug: 'burgers', isActive: true },
    { id: 'coffee', name: 'Кофе', slug: 'coffee', isActive: true },
    { id: 'pasta', name: 'Паста', slug: 'pasta', isActive: true },
    { id: 'soup', name: 'Супы', slug: 'soup', isActive: true },
    { id: 'pizza', name: 'Пицца', slug: 'pizza', isActive: true },
    { id: 'dessert', name: 'Десерты', slug: 'dessert', isActive: true }
  ];
  localStorage.setItem('categories', JSON.stringify(defaultCategories));
}

if (!localStorage.getItem('products')) {
  // Стандартные продукты с привязкой к ресторанам
  const defaultProducts = [
    // Центральный ресторан
    {
      id: 'burger-classic',
      name: 'CLASSIC BURGER',
      category: 'burgers',
      price: 450,
      description: 'Сочная говяжья котлета, фирменный соус, свежие овощи и хрустящая булочка. Идеальное сочетание ингредиентов для настоящих ценителей бургеров.',
      image: 'burger.jpg',
      restaurantIds: ['central']
    },
    {
      id: 'coffee-premium',
      name: 'PREMIUM COFFEE',
      category: 'coffee',
      price: 250,
      description: 'Премиальная арабика, насыщенный вкус, бархатистая текстура и изысканное послевкусие. Идеальный выбор для настоящих кофейных гурманов.',
      image: 'coffee.jpg',
      restaurantIds: ['central']
    },
    {
      id: 'pasta-italian',
      name: 'ITALIAN PASTA',
      category: 'pasta',
      price: 480,
      description: 'Традиционная паста с ароматным соусом, свежей зеленью и пармезаном. Настоящий вкус Италии в каждой порции нашей фирменной пасты.',
      image: 'pasta.jpg',
      restaurantIds: ['central']
    },
    {
      id: 'cheesecake',
      name: 'CHEESECAKE',
      category: 'dessert',
      price: 320,
      description: 'Нежный сливочный чизкейк с хрустящей основой, свежими ягодами и ванильным соусом.',
      image: 'dessert.jpg',
      restaurantIds: ['central', 'west']
    },
    
    // Западный ресторан
    {
      id: 'burger-deluxe',
      name: 'DELUXE BURGER',
      category: 'burgers',
      price: 520,
      description: 'Фирменный бургер с мраморной говядиной, карамелизированным луком, жареным беконом и сыром чеддер на булочке бриошь.',
      image: 'burger.jpg',
      restaurantIds: ['west']
    },
    {
      id: 'cappuccino',
      name: 'CAPPUCCINO',
      category: 'coffee',
      price: 220,
      description: 'Классический итальянский капучино с насыщенным эспрессо и нежной молочной пеной. Подается с корицей по желанию.',
      image: 'coffee.jpg',
      restaurantIds: ['west']
    },
    {
      id: 'carbonara',
      name: 'PASTA CARBONARA',
      category: 'pasta',
      price: 520,
      description: 'Классическая карбонара с гуанчиале, яйцом, сыром пекорино романо и свежемолотым черным перцем.',
      image: 'pasta.jpg',
      restaurantIds: ['west']
    },
    
    // Северный ресторан
    {
      id: 'burger-bbq',
      name: 'BBQ BURGER',
      category: 'burgers',
      price: 480,
      description: 'Сочный бургер с говяжьей котлетой, фирменным BBQ соусом, луковыми кольцами и сыром чеддер.',
      image: 'burger.jpg',
      restaurantIds: ['north']
    },
    {
      id: 'latte',
      name: 'CARAMEL LATTE',
      category: 'coffee',
      price: 270,
      description: 'Нежный латте с добавлением карамельного сиропа, взбитыми сливками и карамельной крошкой.',
      image: 'coffee.jpg',
      restaurantIds: ['north']
    },
    {
      id: 'apple-pie',
      name: 'APPLE PIE',
      category: 'dessert',
      price: 280,
      description: 'Домашний яблочный пирог с корицей и ванильным мороженым. Теплый и уютный десерт для любого времени года.',
      image: 'dessert.jpg',
      restaurantIds: ['north']
    }
  ];
  localStorage.setItem('products', JSON.stringify(defaultProducts));
}

if (!localStorage.getItem('orders')) {
  localStorage.setItem('orders', JSON.stringify([]));
}

if (!localStorage.getItem('settings')) {
  const defaultSettings = {
    siteTitle: 'FOOD MENU',
    contactEmail: 'info@foodmenu.com',
    contactPhone: '+7 (123) 456-78-90',
    telegramBotEnabled: false,
    telegramBotToken: '',
    telegramChatId: ''
  };
  localStorage.setItem('settings', JSON.stringify(defaultSettings));
}

if (!localStorage.getItem('adminCredentials')) {
  const defaultCredentials = {
    username: 'admin',
    password: 'admin' // В реальном приложении пароль должен быть захеширован
  };
  localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
}

// Объект базы данных
const db = {
  // Методы для работы с ресторанами
  restaurants: {
    getAll: function() {
      return JSON.parse(localStorage.getItem('restaurants') || '[]');
    },
    
    getActive: function() {
      return this.getAll().filter(restaurant => restaurant.isActive);
    },
    
    getById: function(id) {
      return this.getAll().find(restaurant => restaurant.id === id);
    },
    
    add: function(restaurant) {
      const restaurants = this.getAll();
      restaurants.push({
        ...restaurant,
        id: restaurant.id || Date.now().toString(),
        isActive: restaurant.isActive !== undefined ? restaurant.isActive : true
      });
      localStorage.setItem('restaurants', JSON.stringify(restaurants));
      return restaurant;
    },
    
    update: function(id, updatedRestaurant) {
      const restaurants = this.getAll();
      const index = restaurants.findIndex(restaurant => restaurant.id === id);
      
      if (index !== -1) {
        restaurants[index] = { ...restaurants[index], ...updatedRestaurant };
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
        return restaurants[index];
      }
      
      return null;
    },
    
    delete: function(id) {
      const restaurants = this.getAll();
      const filteredRestaurants = restaurants.filter(restaurant => restaurant.id !== id);
      
      if (restaurants.length !== filteredRestaurants.length) {
        localStorage.setItem('restaurants', JSON.stringify(filteredRestaurants));
        return true;
      }
      
      return false;
    }
  },
  
  // Методы для работы с категориями
  categories: {
    getAll: function() {
      return JSON.parse(localStorage.getItem('categories') || '[]');
    },
    
    getActive: function() {
      return this.getAll().filter(category => category.isActive);
    },
    
    getById: function(id) {
      return this.getAll().find(category => category.id === id);
    },
    
    add: function(category) {
      const categories = this.getAll();
      categories.push({
        ...category,
        id: category.id || Date.now().toString(),
        isActive: category.isActive !== undefined ? category.isActive : true
      });
      localStorage.setItem('categories', JSON.stringify(categories));
      return category;
    },
    
    update: function(id, updatedCategory) {
      const categories = this.getAll();
      const index = categories.findIndex(category => category.id === id);
      
      if (index !== -1) {
        categories[index] = { ...categories[index], ...updatedCategory };
        localStorage.setItem('categories', JSON.stringify(categories));
        return categories[index];
      }
      
      return null;
    },
    
    delete: function(id) {
      const categories = this.getAll();
      const filteredCategories = categories.filter(category => category.id !== id);
      
      if (categories.length !== filteredCategories.length) {
        localStorage.setItem('categories', JSON.stringify(filteredCategories));
        return true;
      }
      
      return false;
    }
  },
  
  // Методы для работы с продуктами
  products: {
    getAll: function() {
      return JSON.parse(localStorage.getItem('products') || '[]');
    },
    
    getById: function(id) {
      return this.getAll().find(product => product.id === id);
    },
    
    getByRestaurant: function(restaurantId) {
      return this.getAll().filter(product => 
        product.restaurantIds && product.restaurantIds.includes(restaurantId)
      );
    },
    
    getByCategory: function(categoryId) {
      return this.getAll().filter(product => product.category === categoryId);
    },
    
    add: function(product) {
      const products = this.getAll();
      const newProduct = {
        ...product,
        id: product.id || Date.now().toString(),
        restaurantIds: product.restaurantIds || []
      };
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      return newProduct;
    },
    
    update: function(id, updatedProduct) {
      const products = this.getAll();
      const index = products.findIndex(product => product.id === id);
      
      if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        localStorage.setItem('products', JSON.stringify(products));
        return products[index];
      }
      
      return null;
    },
    
    delete: function(id) {
      const products = this.getAll();
      const filteredProducts = products.filter(product => product.id !== id);
      
      if (products.length !== filteredProducts.length) {
        localStorage.setItem('products', JSON.stringify(filteredProducts));
        return true;
      }
      
      return false;
    }
  },
  
  // Методы для работы с заказами
  orders: {
    getAll: function() {
      return JSON.parse(localStorage.getItem('orders') || '[]').sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    
    getById: function(id) {
      return this.getAll().find(order => order.id === id);
    },
    
    getByRestaurant: function(restaurantId) {
      return this.getAll().filter(order => order.restaurantId === restaurantId);
    },
    
    add: function(order) {
      const orders = this.getAll();
      const newOrder = {
        ...order,
        id: order.id || Date.now().toString(),
        status: order.status || 'new',
        createdAt: order.createdAt || new Date().toISOString()
      };
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Отправка уведомления в Telegram (симуляция)
      this.sendTelegramNotification(newOrder);
      
      return newOrder;
    },
    
    update: function(id, updatedOrder) {
      const orders = this.getAll();
      const index = orders.findIndex(order => order.id === id);
      
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updatedOrder };
        localStorage.setItem('orders', JSON.stringify(orders));
        return orders[index];
      }
      
      return null;
    },
    
    delete: function(id) {
      const orders = this.getAll();
      const filteredOrders = orders.filter(order => order.id !== id);
      
      if (orders.length !== filteredOrders.length) {
        localStorage.setItem('orders', JSON.stringify(filteredOrders));
        return true;
      }
      
      return false;
    },
    
    // Симуляция отправки уведомления в Telegram
    sendTelegramNotification: function(order) {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}');
      
      if (settings.telegramBotEnabled && settings.telegramBotToken && settings.telegramChatId) {
        console.log('Отправка уведомления в Telegram о новом заказе:', order);
        
        // В реальном приложении здесь был бы запрос к API Telegram
        // Для симуляции просто сохраняем информацию о последнем уведомлении
        localStorage.setItem('lastTelegramNotification', JSON.stringify({
          type: 'new_order',
          orderId: order.id,
          sentAt: new Date().toISOString()
        }));
      }
    }
  },
  
  // Методы для работы с настройками
  settings: {
    getAll: function() {
      return JSON.parse(localStorage.getItem('settings') || '{}');
    },
    
    get: function(key, defaultValue) {
      const settings = this.getAll();
      return settings[key] !== undefined ? settings[key] : defaultValue;
    },
    
    update: function(updatedSettings) {
      const settings = this.getAll();
      const newSettings = { ...settings, ...updatedSettings };
      localStorage.setItem('settings', JSON.stringify(newSettings));
      return newSettings;
    }
  },
  
  // Методы для авторизации администратора
  auth: {
    getCredentials: function() {
      return JSON.parse(localStorage.getItem('adminCredentials') || '{}');
    },
    
    login: function(username, password) {
      const credentials = this.getCredentials();
      
      // В реальном приложении пароли должны быть захешированы
      if (credentials.username === username && credentials.password === password) {
        const sessionToken = Math.random().toString(36).substring(2);
        sessionStorage.setItem('adminSession', sessionToken);
        return true;
      }
      
      return false;
    },
    
    logout: function() {
      sessionStorage.removeItem('adminSession');
      return true;
    },
    
    isAuthenticated: function() {
      return !!sessionStorage.getItem('adminSession');
    },
    
    updateCredentials: function(username, password) {
      localStorage.setItem('adminCredentials', JSON.stringify({ username, password }));
      return true;
    }
  },
  
  // Методы для корзины
  cart: {
    get: function() {
      return JSON.parse(localStorage.getItem('cart') || '{"items":[], "restaurantId": null}');
    },
    
    addItem: function(productId, quantity = 1) {
      const cart = this.get();
      const product = db.products.getById(productId);
      
      if (!product) {
        return { success: false, error: 'Товар не найден' };
      }
      
      // Проверяем, что все товары из одного ресторана
      if (cart.restaurantId && product.restaurantIds && !product.restaurantIds.includes(cart.restaurantId)) {
        return { 
          success: false, 
          error: 'В корзине могут быть товары только из одного ресторана. Сначала очистите корзину.' 
        };
      }
      
      const existingItem = cart.items.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          name: product.name,
          price: product.price,
          quantity
        });
        
        // Устанавливаем ресторан, если это первый товар
        if (!cart.restaurantId && product.restaurantIds && product.restaurantIds.length > 0) {
          cart.restaurantId = product.restaurantIds[0];
        }
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      return { success: true, cart };
    },
    
    updateQuantity: function(productId, quantity) {
      const cart = this.get();
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex === -1) {
        return { success: false, error: 'Товар не найден в корзине' };
      }
      
      if (quantity <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].quantity = quantity;
      }
      
      // Если корзина стала пустой, сбрасываем ресторан
      if (cart.items.length === 0) {
        cart.restaurantId = null;
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      return { success: true, cart };
    },
    
    removeItem: function(productId) {
      return this.updateQuantity(productId, 0);
    },
    
    clear: function() {
      localStorage.setItem('cart', JSON.stringify({ items: [], restaurantId: null }));
      return { success: true, cart: { items: [], restaurantId: null } };
    },
    
    getTotalPrice: function() {
      const cart = this.get();
      return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getTotalItems: function() {
      const cart = this.get();
      return cart.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    checkout: function(customerInfo) {
      const cart = this.get();
      
      if (cart.items.length === 0) {
        return { success: false, error: 'Корзина пуста' };
      }
      
      if (!cart.restaurantId) {
        return { success: false, error: 'Не указан ресторан' };
      }
      
      // Создаем заказ
      const order = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || '',
        pickupTime: customerInfo.pickupTime || 30,
        status: 'new',
        totalAmount: this.getTotalPrice(),
        items: cart.items,
        restaurantId: cart.restaurantId,
        createdAt: new Date().toISOString()
      };
      
      const newOrder = db.orders.add(order);
      
      // Очищаем корзину после успешного оформления заказа
      this.clear();
      
      return { success: true, order: newOrder };
    }
  },
  
  // Статистика для админ-панели
  statistics: {
    getDashboardStats: function() {
      const orders = db.orders.getAll();
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
      
      // Топ-5 популярных товаров
      const productStats = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          productStats[item.productId] = (productStats[item.productId] || 0) + item.quantity;
        });
      });
      
      const topProducts = Object.entries(productStats)
        .map(([productId, quantity]) => {
          const product = db.products.getById(productId);
          return { 
            id: productId, 
            name: product ? product.name : 'Неизвестный товар', 
            quantity 
          };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      
      return {
        restaurantCount: db.restaurants.getAll().length,
        productCount: db.products.getAll().length,
        orderCount: orders.length,
        totalRevenue,
        recentOrders: orders.slice(0, 5),
        orderStatusStats,
        restaurantStats,
        topProducts
      };
    }
  }
};

// Экспорт объекта базы данных
window.db = db;
