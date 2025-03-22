// db.js - Unified file for data storage and API logic for the restaurant application

// Telegram notification function
function sendTelegramNotification(botToken, chatId, message) {
  // В новой версии уведомления будут обрабатываться на сервере
  return fetch('/api/telegram/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ botToken, chatId, message })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Telegram notification failed');
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
  // Утилита для выполнения запросов
  async fetchJson(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await fetch(url, {...defaultOptions, ...options});
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Что-то пошло не так');
    }
    
    return await response.json();
  },

  // Методы работы с ресторанами
  restaurants: {
    async getAll() {
      return await this.fetchJson('/api/restaurants');
    },
    
    async getActive() {
      return (await this.getAll()).filter(restaurant => restaurant.isActive);
    },
    
    async getById(id) {
      const restaurants = await this.getAll();
      return restaurants.find(restaurant => restaurant.id === id);
    },
    
    async add(restaurant) {
      return await this.fetchJson('/api/restaurants', {
        method: 'POST',
        body: JSON.stringify({
          ...restaurant,
          id: restaurant.id || Date.now().toString(),
          isActive: restaurant.isActive !== undefined ? restaurant.isActive : true
        })
      });
    },
    
    async update(id, updatedRestaurant) {
      return await this.fetchJson(`/api/restaurants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedRestaurant)
      });
    },
    
    async delete(id) {
      return await this.fetchJson(`/api/restaurants/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Методы работы с категориями
  categories: {
    async getAll() {
      return await this.fetchJson('/api/categories');
    },
    
    async getActive() {
      return (await this.getAll()).filter(category => category.isActive);
    },
    
    async getById(id) {
      const categories = await this.getAll();
      return categories.find(category => category.id === id);
    },
    
    async add(category) {
      return await this.fetchJson('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          ...category,
          id: category.id || Date.now().toString(),
          isActive: category.isActive !== undefined ? category.isActive : true
        })
      });
    },
    
    async update(id, updatedCategory) {
      return await this.fetchJson(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCategory)
      });
    },
    
    async delete(id) {
      return await this.fetchJson(`/api/categories/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Методы работы с продуктами
  products: {
    async getAll() {
      return await this.fetchJson('/api/products');
    },
    
    async getById(id) {
      const products = await this.getAll();
      return products.find(product => product.id === id);
    },
    
    async getByRestaurant(restaurantId) {
      return await this.fetchJson(`/api/products?restaurantId=${restaurantId}`);
    },
    
    async getByCategory(categoryId) {
      return await this.fetchJson(`/api/products?category=${categoryId}`);
    },
    
    async add(product) {
      return await this.fetchJson('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          ...product,
          id: product.id || Date.now().toString(),
          restaurantIds: product.restaurantIds || []
        })
      });
    },
    
    async update(id, updatedProduct) {
      return await this.fetchJson(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct)
      });
    },
    
    async delete(id) {
      return await this.fetchJson(`/api/products/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  // Методы работы с заказами
  orders: {
    async getAll() {
      const orders = await this.fetchJson('/api/orders');
      return orders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    
    async getById(id) {
      return await this.fetchJson(`/api/orders/${id}`);
    },
    
    async getByRestaurant(restaurantId) {
      return await this.fetchJson(`/api/orders?restaurantId=${restaurantId}`);
    },
    
    async add(order) {
      return await this.fetchJson('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...order,
          id: order.id || Date.now().toString(),
          status: order.status || 'new',
          createdAt: order.createdAt || new Date().toISOString()
        })
      });
    },
    
    async update(id, updatedOrder) {
      return await this.fetchJson(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedOrder)
      });
    },
    
    async delete(id) {
      return await this.fetchJson(`/api/orders/${id}`, {
        method: 'DELETE'
      });
    },
    
    // Отправка уведомлений в Telegram
    async sendTelegramNotification(order) {
      return await this.fetchJson('/api/telegram/order-notification', {
        method: 'POST',
        body: JSON.stringify(order)
      });
    }
  },
  
  // Методы работы с настройками
  settings: {
    async getAll() {
      return await this.fetchJson('/api/settings');
    },
    
    async get(key, defaultValue) {
      const settings = await this.getAll();
      return settings[key] !== undefined ? settings[key] : defaultValue;
    },
    
    async update(updatedSettings) {
      return await this.fetchJson('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(updatedSettings)
      });
    }
  },
  
  // Методы авторизации администратора
  auth: {
    async getCredentials() {
      // В новой версии credentials хранятся на сервере
      return await this.fetchJson('/api/admin/credentials');
    },
    
    async login(username, password) {
      try {
        const result = await this.fetchJson('/api/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });

        if (result.success) {
          sessionStorage.setItem('adminSession', result.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Ошибка входа:', error);
        return false;
      }
    },
    
    logout() {
      sessionStorage.removeItem('adminSession');
      return true;
    },
    
    isAuthenticated() {
      return !!sessionStorage.getItem('adminSession');
    },
    
    async updateCredentials(username, password) {
      return await this.fetchJson('/api/admin/credentials', {
        method: 'PUT',
        body: JSON.stringify({ username, password })
      });
    }
  },
  
  // Методы работы с корзиной
  cart: {
    get() {
      return JSON.parse(localStorage.getItem('cart') || '{"items":[], "restaurantId": null}');
    },
    
    async addItem(productId, quantity = 1) {
      const cart = this.get();
      try {
        const product = await this.fetchJson(`/api/products/${productId}`);
        
        if (!product) {
          return { success: false, error: 'Product not found' };
        }
        
        // Проверка, что все товары из одного ресторана
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
        return { success: false, error: error.message };
      }
    },
    
    updateQuantity(productId, quantity) {
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
      
      // Если корзина пуста, сбрасываем ресторан
      if (cart.items.length === 0) {
        cart.restaurantId = null;
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      return { success: true, cart };
    },
    
    removeItem(productId) {
      return this.updateQuantity(productId, 0);
    },
    
    clear() {
      localStorage.setItem('cart', JSON.stringify({ items: [], restaurantId: null }));
      return { success: true, cart: { items: [], restaurantId: null } };
    },
    
    getTotalPrice() {
      const cart = this.get();
      return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getTotalItems() {
      const cart = this.get();
      return cart.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    async checkout(customerInfo) {
      const cart = this.get();
      
      if (cart.items.length === 0) {
        return { success: false, error: 'Your cart is empty' };
      }
      
      if (!cart.restaurantId) {
        return { success: false, error: 'No restaurant selected' };
      }
      
      try {
        const order = {
          customerName: customerInfo.name,
          restaurantId: cart.restaurantId,
          items: cart.items,
          totalAmount: this.getTotalPrice(),
          status: 'new',
          createdAt: new Date().toISOString()
        };
        
        const newOrder = await this.fetchJson('/api/orders', {
          method: 'POST',
          body: JSON.stringify(order)
        });
        
        // Очищаем корзину после успешного оформления заказа
        this.clear();
        
        return { success: true, order: newOrder };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  
  // Статистика для административной панели
  statistics: {
    async getDashboardStats() {
      try {
        const [
          restaurants, 
          products, 
          orders, 
          settings
        ] = await Promise.all([
          this.fetchJson('/api/restaurants'),
          this.fetchJson('/api/products'),
          this.fetchJson('/api/orders'),
          this.fetchJson('/api/settings')
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Группировка статусов заказов
        const orderStatusStats = orders.reduce((stats, order) => {
          stats[order.status] = (stats[order.status] || 0) + 1;
          return stats;
        }, {});

        // Статистика по ресторанам
        const restaurantStats = orders.reduce((stats, order) => {
          stats[order.restaurantId] = (stats[order.restaurantId] || 0) + 1;
          return stats;
        }, {});

        // Топ продуктов
        const productStats = orders.reduce((stats, order) => {
          order.items.forEach(item => {
            stats[item.productId] = (stats[item.productId] || 0) + item.quantity;
          });
          return stats;
        }, {});

        const topProducts = Object.entries(productStats)
          .map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            return { 
              id: productId, 
              name: product ? product.name : 'Unknown product', 
              quantity 
            };
          })
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        return {
          restaurantCount: restaurants.length,
          productCount: products.length,
          orderCount: orders.length,
          totalRevenue: 0,
          recentOrders: [],
          orderStatusStats: {},
          restaurantStats: {},
          topProducts: []
        };
      }
    }
  }
};

// Глобальный обработчик ошибок
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  alert('Произошла ошибка: ' + event.reason.message);
});

window.db = db;