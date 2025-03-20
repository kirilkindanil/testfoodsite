// db.js - Unified file for data storage and API logic for the restaurant application

// Telegram notification function
function sendTelegramNotification(botToken, chatId, message) {
  // Check if the required parameters are present
  if (!botToken || !chatId || !message) {
    console.error('Missing required parameters for Telegram notification');
    return false;
  }
  
  // Create the API URL with the bot token
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  // Create the request payload
  const requestData = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  };
  
  // Send the API request
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Telegram API response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Telegram notification sent successfully:', data);
    return true;
  })
  .catch(error => {
    console.error('Error sending Telegram notification:', error);
    return false;
  });
}

// Initialize local storage if it's empty
if (!localStorage.getItem('restaurants')) {
  // Default restaurants
  const defaultRestaurants = [
    {
      id: 'central',
      name: 'Food Menu Central',
      address: '15 Tverskaya St., Moscow, 123056',
      hours: 'Mon-Fri: 10:00 - 22:00, Sat-Sun: 11:00 - 23:00',
      phone: '+7 (495) 123-45-67',
      email: 'central@foodmenu.com',
      isActive: true,  // добавлена запятая
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
      icon: 'images/restaurant-icons/central.png',  // URL изображения или данные base64
      deliveryTime: '25'  // Время доставки в минутах (строка)
    },
    {
      id: 'north',
      name: 'Food Menu North',
      address: '163A Dmitrovskoye Hwy., Moscow, 127280',
      hours: 'Mon-Fri: 10:00 - 21:00, Sat-Sun: 11:00 - 22:00',
      phone: '+7 (495) 111-22-33',
      email: 'north@foodmenu.com',
      isActive: true,
      icon: 'images/restaurant-icons/central.png',  // URL изображения или данные base64
      deliveryTime: '25'  // Время доставки в минутах (строка)
    }
  ];
  localStorage.setItem('restaurants', JSON.stringify(defaultRestaurants));
}

if (!localStorage.getItem('categories')) {
  // Default categories
  const defaultCategories = [
    { id: 'all', name: 'All', slug: 'all', isActive: true },
    { id: 'burgers', name: 'Burgers', slug: 'burgers', isActive: true },
    { id: 'coffee', name: 'Coffee', slug: 'coffee', isActive: true },
    { id: 'pasta', name: 'Pasta', slug: 'pasta', isActive: true },
    { id: 'soup', name: 'Soups', slug: 'soup', isActive: true },
    { id: 'pizza', name: 'Pizza', slug: 'pizza', isActive: true },
    { id: 'dessert', name: 'Desserts', slug: 'dessert', isActive: true }
  ];
  localStorage.setItem('categories', JSON.stringify(defaultCategories));
}

if (!localStorage.getItem('products')) {
  // Default products linked to restaurants
  const defaultProducts = [
    // Central restaurant
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
    
    // West restaurant
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
    },
    {
      id: 'carbonara',
      name: 'PASTA CARBONARA',
      category: 'pasta',
      price: 520,
      description: 'Classic carbonara with guanciale, egg, pecorino romano cheese, and freshly ground black pepper.',
      image: 'pasta.jpg',
      restaurantIds: ['west']
    },
    
    // North restaurant
    {
      id: 'burger-bbq',
      name: 'BBQ BURGER',
      category: 'burgers',
      price: 480,
      description: 'Juicy burger with beef patty, signature BBQ sauce, onion rings, and cheddar cheese.',
      image: 'burger.jpg',
      restaurantIds: ['north']
    },
    {
      id: 'latte',
      name: 'CARAMEL LATTE',
      category: 'coffee',
      price: 270,
      description: 'Delicate latte with caramel syrup, whipped cream, and caramel crumble.',
      image: 'coffee.jpg',
      restaurantIds: ['north']
    },
    {
      id: 'apple-pie',
      name: 'APPLE PIE',
      category: 'dessert',
      price: 280,
      description: 'Homemade apple pie with cinnamon and vanilla ice cream. A warm and cozy dessert for any time of year.',
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
    password: 'admin' // In a real application, the password should be hashed
  };
  localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
}

// Function to format date and time
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

// Database object
const db = {
  // Methods for working with restaurants
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
  
  // Methods for working with categories
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
  
  // Methods for working with products
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
  
  // Methods for working with orders
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
      
      // Send notification to Telegram
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
    
    // Send notification to Telegram
    sendTelegramNotification: function(order) {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}');
      
      if (settings.telegramBotEnabled && settings.telegramBotToken && settings.telegramChatId) {
        console.log('Sending Telegram notification about new order:', order);
        
        // Format order details for message
        const restaurant = db.restaurants.getById(order.restaurantId) || { name: 'Unknown Restaurant' };
        const orderItems = order.items.map(item => `• ${item.name} x${item.quantity} - ${item.price * item.quantity}₽`).join('\n');
        
        // Create notification message
        const message = `
<b>🔔 NEW ORDER #${order.id}</b>

<b>Customer:</b> ${order.customerName}
<b>Phone:</b> ${order.customerPhone}
<b>Restaurant:</b> ${restaurant.name}
<b>Pickup Time:</b> ${order.pickupTime} minutes
<b>Order Time:</b> ${formatDateTime(order.createdAt)}
<b>Total Amount:</b> ${order.totalAmount}₽

<b>Order Items:</b>
${orderItems}
        `.trim();
        
        // Try to send the notification to Telegram
        sendTelegramNotification(settings.telegramBotToken, settings.telegramChatId, message)
          .then(success => {
            // Save notification status
            localStorage.setItem('lastTelegramNotification', JSON.stringify({
              type: 'new_order',
              orderId: order.id,
              sentAt: new Date().toISOString(),
              success: success
            }));
          });
      }
    }
  },
  
  // Methods for working with settings
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
  
  // Methods for administrator authorization
  auth: {
    getCredentials: function() {
      return JSON.parse(localStorage.getItem('adminCredentials') || '{}');
    },
    
    login: function(username, password) {
      const credentials = this.getCredentials();
      
      // In a real application, passwords should be hashed
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
  
  // Methods for the shopping cart
  cart: {
    get: function() {
      return JSON.parse(localStorage.getItem('cart') || '{"items":[], "restaurantId": null}');
    },
    
    addItem: function(productId, quantity = 1) {
      const cart = this.get();
      const product = db.products.getById(productId);
      
      if (!product) {
        return { success: false, error: 'Product not found' };
      }
      
      // Check that all items are from the same restaurant
      if (cart.restaurantId && product.restaurantIds && !product.restaurantIds.includes(cart.restaurantId)) {
        return { 
          success: false, 
          error: 'You can only add items from one restaurant at a time. Please clear your cart first.' 
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
        
        // Set restaurant if this is the first item
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
        return { success: false, error: 'Item not found in cart' };
      }
      
      if (quantity <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].quantity = quantity;
      }
      
      // If cart is empty, reset restaurant
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
        return { success: false, error: 'Your cart is empty' };
      }
      
      if (!cart.restaurantId) {
        return { success: false, error: 'No restaurant selected' };
      }
      
      // Создаем заказ с модифицированной структурой
      const order = {
        customerName: customerInfo.name,
        // Удалены телефон и другие ненужные поля
        deliveryTime: customerInfo.deliveryTime || '30',
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
    }, // Закрывающая скобка для объекта cart и запятая

  
  // Statistics for admin panel
  statistics: {
    getDashboardStats: function() {
      const orders = db.orders.getAll();
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Order status statistics
      const orderStatusStats = {};
      orders.forEach(order => {
        orderStatusStats[order.status] = (orderStatusStats[order.status] || 0) + 1;
      });
      
      // Restaurant statistics
      const restaurantStats = {};
      orders.forEach(order => {
        restaurantStats[order.restaurantId] = (restaurantStats[order.restaurantId] || 0) + 1;
      });
      
      // Top 5 popular products
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
            name: product ? product.name : 'Unknown product', 
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

// Export database object
window.db = db;
