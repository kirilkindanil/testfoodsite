// db-api.js - Клиентский API для взаимодействия с серверной частью

// Базовый URL API
const API_URL = 'http://localhost:3000/api';

// Вспомогательная функция для выполнения запросов
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  // Добавляем токен авторизации, если он есть
  const token = sessionStorage.getItem('adminToken');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, options);
    
    // Если статус не ОК, выбрасываем ошибку
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Ошибка ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Telegram notification function (оставлена для совместимости)
function sendTelegramNotification(botToken, chatId, message) {
  // Проверяем, что необходимые параметры присутствуют
  if (!botToken || !chatId || !message) {
    console.error('Missing required parameters for Telegram notification');
    return false;
  }
  
  // Создаем URL API с токеном бота
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  // Создаем данные запроса
  const requestData = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  };
  
  // Отправляем API запрос
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

// Функция для форматирования даты и времени
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

// Объект базы данных
const db = {
  // Методы для работы с ресторанами
  restaurants: {
    getAll: async function() {
      return await apiRequest('/restaurants');
    },
    
    getActive: async function() {
      return await apiRequest('/restaurants/active');
    },
    
    getById: async function(id) {
      return await apiRequest(`/restaurants/${id}`);
    },
    
    add: async function(restaurant) {
      return await apiRequest('/restaurants', 'POST', restaurant);
    },
    
    update: async function(id, updatedRestaurant) {
      return await apiRequest(`/restaurants/${id}`, 'PUT', updatedRestaurant);
    },
    
    delete: async function(id) {
      return await apiRequest(`/restaurants/${id}`, 'DELETE');
    }
  },
  
  // Методы для работы с категориями
  categories: {
    getAll: async function() {
      return await apiRequest('/categories');
    },
    
    getActive: async function() {
      return await apiRequest('/categories/active');
    },
    
    getById: async function(id) {
      return await apiRequest(`/categories/${id}`);
    },
    
    add: async function(category) {
      return await apiRequest('/categories', 'POST', category);
    },
    
    update: async function(id, updatedCategory) {
      return await apiRequest(`/categories/${id}`, 'PUT', updatedCategory);
    },
    
    delete: async function(id) {
      return await apiRequest(`/categories/${id}`, 'DELETE');
    }
  },
  
  // Методы для работы с продуктами
  products: {
    getAll: async function() {
      return await apiRequest('/products');
    },
    
    getById: async function(id) {
      return await apiRequest(`/products/${id}`);
    },
    
    getByRestaurant: async function(restaurantId) {
      return await apiRequest(`/products/restaurant/${restaurantId}`);
    },
    
    getByCategory: async function(categoryId) {
      return await apiRequest(`/products/category/${categoryId}`);
    },
    
    add: async function(product) {
      return await apiRequest('/products', 'POST', product);
    },
    
    update: async function(id, updatedProduct) {
      return await apiRequest(`/products/${id}`, 'PUT', updatedProduct);
    },
    
    delete: async function(id) {
      return await apiRequest(`/products/${id}`, 'DELETE');
    }
  },
  
  // Методы для работы с заказами
  orders: {
    getAll: async function() {
      return await apiRequest('/orders');
    },
    
    getById: async function(id) {
      return await apiRequest(`/orders/${id}`);
    },
    
    getByRestaurant: async function(restaurantId) {
      return await apiRequest(`/orders/restaurant/${restaurantId}`);
    },
    
    add: async function(order) {
      return await apiRequest('/orders', 'POST', order);
    },
    
    update: async function(id, updatedOrder) {
      return await apiRequest(`/orders/${id}`, 'PUT', updatedOrder);
    },
    
    delete: async function(id) {
      return await apiRequest(`/orders/${id}`, 'DELETE');
    },
    
    // Оставляем метод для отправки уведомлений в Telegram (для совместимости)
    sendTelegramNotification: async function(order) {
      const settings = await db.settings.getAll();
      
      if (settings.telegramBotEnabled && settings.telegramBotToken && settings.telegramChatId) {
        console.log('Sending Telegram notification about new order:', order);
        
        // Получаем данные о ресторане
        const restaurant = await db.restaurants.getById(order.restaurantId).catch(() => ({ name: 'Unknown Restaurant' }));
        const orderItems = order.items.map(item => `• ${item.name} x${item.quantity} - ${item.price * item.quantity}₽`).join('\n');
        
        // Создаем текст уведомления
        const message = `
<b>🔔 NEW ORDER #${order.id}</b>

<b>Customer:</b> ${order.customerName}
<b>Phone:</b> ${order.customerPhone || 'Not provided'}
<b>Restaurant:</b> ${restaurant.name}
<b>Pickup Time:</b> ${order.pickupTime || order.deliveryTime || '30'} minutes
<b>Order Time:</b> ${formatDateTime(order.createdAt)}
<b>Total Amount:</b> ${order.totalAmount}₽

<b>Order Items:</b>
${orderItems}
        `.trim();
        
        // Отправляем уведомление в Telegram
        try {
          const success = await sendTelegramNotification(settings.telegramBotToken, settings.telegramChatId, message);
          
          // Сохранение статуса отправки
          localStorage.setItem('lastTelegramNotification', JSON.stringify({
            type: 'new_order',
            orderId: order.id,
            sentAt: new Date().toISOString(),
            success: success
          }));
          
          return success;
        } catch (error) {
          console.error('Error sending Telegram notification:', error);
          return false;
        }
      }
      
      return false;
    }
  },
  
  // Методы для работы с настройками
  settings: {
    getAll: async function() {
      return await apiRequest('/settings');
    },
    
    get: async function(key, defaultValue) {
      const settings = await this.getAll();
      return settings[key] !== undefined ? settings[key] : defaultValue;
    },
    
    update: async function(updatedSettings) {
      return await apiRequest('/settings', 'PUT', updatedSettings);
    }
  },
  
  // Методы для аутентификации администраторов
  auth: {
    login: async function(username, password) {
      try {
        const response = await apiRequest('/auth/login', 'POST', { username, password });
        
        if (response.success && response.token) {
          sessionStorage.setItem('adminToken', response.token);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Authentication error:', error);
        return false;
      }
    },
    
    logout: function() {
      sessionStorage.removeItem('adminToken');
      return true;
    },
    
    isAuthenticated: function() {
      return !!sessionStorage.getItem('adminToken');
    },
    
    updateCredentials: async function(username, password) {
      try {
        // Это упрощенный подход - в реальном приложении здесь должна быть отдельная защищенная конечная точка API
        const settings = await db.settings.getAll();
        settings.adminCredentials = { username, password };
        await db.settings.update(settings);
        return true;
      } catch (error) {
        console.error('Error updating credentials:', error);
        return false;
      }
    }
  },
  
  // Методы для работы с корзиной (локальное хранение для корзины оставляем)
  cart: {
    get: function() {
      return JSON.parse(localStorage.getItem('cart') || '{"items":[], "restaurantId": null}');
    },
    
    addItem: async function(productId, quantity = 1) {
      const cart = this.get();
      
      try {
        const product = await db.products.getById(productId);
        
        if (!product) {
          return { success: false, error: 'Product not found' };
        }
        
        // Проверяем, что все товары из одного ресторана
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
          
          // Устанавливаем ресторан, если это первый товар
          if (!cart.restaurantId && product.restaurantIds && product.restaurantIds.length > 0) {
            cart.restaurantId = product.restaurantIds[0];
          }
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        return { success: true, cart };
      } catch (error) {
        console.error('Error adding item to cart:', error);
        return { success: false, error: error.message };
      }
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
      
      // Если корзина пуста, сбрасываем выбранный ресторан
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
    
    checkout: async function(customerInfo) {
      const cart = this.get();
      
      if (cart.items.length === 0) {
        return { success: false, error: 'Your cart is empty' };
      }
      
      if (!cart.restaurantId) {
        return { success: false, error: 'No restaurant selected' };
      }
      
      try {
        // Создаем заказ
        const order = {
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone || '',
          deliveryTime: customerInfo.deliveryTime || '30',
          status: 'new',
          totalAmount: this.getTotalPrice(),
          items: cart.items,
          restaurantId: cart.restaurantId,
          createdAt: new Date().toISOString()
        };
        
        // Отправляем заказ на сервер
        const newOrder = await db.orders.add(order);
        
        // Очищаем корзину после успешного оформления заказа
        this.clear();
        
        return { success: true, order: newOrder };
      } catch (error) {
        console.error('Error during checkout:', error);
        return { success: false, error: error.message };
      }
    }
  },
  
  // Статистика для админ-панели
  statistics: {
    getDashboardStats: async function() {
      return await apiRequest('/statistics/dashboard');
    }
  }
};

// Экспортируем объект базы данных
window.db = db;