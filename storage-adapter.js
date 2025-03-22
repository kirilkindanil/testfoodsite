// storage-adapter.js
// Адаптер, перенаправляющий операции localStorage в Firebase

// Загружаем Firebase SDK
// Примечание: Добавьте эти скрипты в ваши HTML файлы перед storage-adapter.js
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"></script>

(function() {
  // Конфигурация Firebase
  // Замените на свои данные из Firebase Console
  const firebaseConfig = {
  apiKey: "AIzaSyCjIxeGed56L1Z8LoKfEgKHwlX3LZMIsMQ",
  authDomain: "greenbaboosite.firebaseapp.com",
  databaseURL: "https://greenbaboosite-default-rtdb.firebaseio.com",
  projectId: "greenbaboosite",
  storageBucket: "greenbaboosite.firebasestorage.app",
  messagingSenderId: "432777867771",
  appId: "1:432777867771:web:f7edeb777e7180145d5b5e",
  measurementId: "G-QWTNTK6XJD"
};

  // Инициализация Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Локальный кэш для хранения данных
  const localCache = {
    restaurants: null,
    categories: null,
    products: null,
    orders: null,
    settings: null,
    adminCredentials: null
  };
  
  // Флаг, указывающий на состояние инициализации
  let initialized = false;
  let isOffline = false;
  
  // Очередь для операций при отсутствии соединения
  const pendingOperations = [];
  
  // Состояние сети Firebase
  firebase.database().ref('.info/connected').on('value', (snapshot) => {
    isOffline = !snapshot.val();
    
    if (!isOffline && pendingOperations.length > 0) {
      console.log(`Восстановление соединения. Отправка ${pendingOperations.length} отложенных операций`);
      processPendingOperations();
    }
  });
  
  // Обработка отложенных операций
  function processPendingOperations() {
    while (pendingOperations.length > 0 && !isOffline) {
      const operation = pendingOperations.shift();
      
      try {
        if (operation.type === 'set') {
          database.ref(operation.path).set(operation.data);
        } else if (operation.type === 'remove') {
          database.ref(operation.path).remove();
        }
      } catch (error) {
        console.error('Ошибка при выполнении отложенной операции:', error);
        // Возвращаем обратно в очередь при ошибке
        pendingOperations.unshift(operation);
        break;
      }
    }
  }
  
  // Загрузка первоначальных данных из Firebase
  function loadInitialData() {
    if (initialized) return Promise.resolve();
    
    console.log('Загрузка данных из Firebase...');
    
    const loadPromises = [];
    
    // Загрузка ресторанов
    loadPromises.push(
      database.ref('restaurants').once('value')
        .then(snapshot => {
          const data = snapshot.val() || {};
          
          if (Object.keys(data).length > 0) {
            localCache.restaurants = Object.values(data);
            originalSetItem('restaurants', JSON.stringify(localCache.restaurants));
            console.log('Рестораны загружены из Firebase');
          } else {
            const localData = originalGetItem('restaurants');
            
            if (localData) {
              try {
                localCache.restaurants = JSON.parse(localData);
                
                const restaurantsObj = {};
                localCache.restaurants.forEach(restaurant => {
                  restaurantsObj[restaurant.id] = restaurant;
                });
                
                database.ref('restaurants').set(restaurantsObj);
                console.log('Дефолтные рестораны сохранены в Firebase');
              } catch (e) {
                console.error('Ошибка парсинга локальных данных ресторанов:', e);
              }
            }
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке ресторанов:', error);
        })
    );
    
    // Загрузка категорий
    loadPromises.push(
      database.ref('categories').once('value')
        .then(snapshot => {
          const data = snapshot.val() || {};
          
          if (Object.keys(data).length > 0) {
            localCache.categories = Object.values(data);
            originalSetItem('categories', JSON.stringify(localCache.categories));
            console.log('Категории загружены из Firebase');
          } else {
            const localData = originalGetItem('categories');
            
            if (localData) {
              try {
                localCache.categories = JSON.parse(localData);
                
                const categoriesObj = {};
                localCache.categories.forEach(category => {
                  categoriesObj[category.id] = category;
                });
                
                database.ref('categories').set(categoriesObj);
                console.log('Дефолтные категории сохранены в Firebase');
              } catch (e) {
                console.error('Ошибка парсинга локальных данных категорий:', e);
              }
            }
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке категорий:', error);
        })
    );
    
    // Загрузка продуктов
    loadPromises.push(
      database.ref('products').once('value')
        .then(snapshot => {
          const data = snapshot.val() || {};
          
          if (Object.keys(data).length > 0) {
            localCache.products = Object.values(data);
            originalSetItem('products', JSON.stringify(localCache.products));
            console.log('Продукты загружены из Firebase');
          } else {
            const localData = originalGetItem('products');
            
            if (localData) {
              try {
                localCache.products = JSON.parse(localData);
                
                const productsObj = {};
                localCache.products.forEach(product => {
                  productsObj[product.id] = product;
                });
                
                database.ref('products').set(productsObj);
                console.log('Дефолтные продукты сохранены в Firebase');
              } catch (e) {
                console.error('Ошибка парсинга локальных данных продуктов:', e);
              }
            }
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке продуктов:', error);
        })
    );
    
    // Загрузка заказов
    loadPromises.push(
      database.ref('orders').once('value')
        .then(snapshot => {
          const data = snapshot.val() || {};
          
          if (Object.keys(data).length > 0) {
            localCache.orders = Object.values(data);
            originalSetItem('orders', JSON.stringify(localCache.orders));
            console.log('Заказы загружены из Firebase');
          } else {
            const localData = originalGetItem('orders');
            
            if (localData) {
              try {
                localCache.orders = JSON.parse(localData);
                
                const ordersObj = {};
                localCache.orders.forEach(order => {
                  ordersObj[order.id] = order;
                });
                
                database.ref('orders').set(ordersObj);
                console.log('Дефолтные заказы сохранены в Firebase');
              } catch (e) {
                console.error('Ошибка парсинга локальных данных заказов:', e);
              }
            }
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке заказов:', error);
        })
    );
    
    // Загрузка настроек
    loadPromises.push(
      database.ref('settings').once('value')
        .then(snapshot => {
          const data = snapshot.val() || {};
          
          if (Object.keys(data).length > 0) {
            localCache.settings = data;
            originalSetItem('settings', JSON.stringify(localCache.settings));
            console.log('Настройки загружены из Firebase');
          } else {
            const localData = originalGetItem('settings');
            
            if (localData) {
              try {
                localCache.settings = JSON.parse(localData);
                database.ref('settings').set(localCache.settings);
                console.log('Дефолтные настройки сохранены в Firebase');
              } catch (e) {
                console.error('Ошибка парсинга локальных данных настроек:', e);
              }
            }
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке настроек:', error);
        })
    );
    
    // Загрузка учетных данных
    loadPromises.push(
      database.ref('adminCredentials').once('value')
        .then(snapshot => {
          const data = snapshot.val() || {};
          
          if (Object.keys(data).length > 0) {
            localCache.adminCredentials = data;
            originalSetItem('adminCredentials', JSON.stringify(localCache.adminCredentials));
            console.log('Учетные данные загружены из Firebase');
          } else {
            const localData = originalGetItem('adminCredentials');
            
            if (localData) {
              try {
                localCache.adminCredentials = JSON.parse(localData);
                database.ref('adminCredentials').set(localCache.adminCredentials);
                console.log('Дефолтные учетные данные сохранены в Firebase');
              } catch (e) {
                console.error('Ошибка парсинга локальных данных учетных данных:', e);
              }
            }
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке учетных данных:', error);
        })
    );
    
    // Когда все данные загружены
    return Promise.all(loadPromises)
      .then(() => {
        initialized = true;
        console.log('Все данные загружены из Firebase');
      })
      .catch(error => {
        console.error('Произошла ошибка при инициализации данных:', error);
        // Все равно помечаем как инициализированные, чтобы избежать повторных попыток
        initialized = true;
      });
  }
  
  // Настраиваем слушатели для реального времени
  function setupRealTimeListeners() {
    // Слушатель для ресторанов
    database.ref('restaurants').on('value', snapshot => {
      const data = snapshot.val() || {};
      localCache.restaurants = Object.values(data);
      originalSetItem('restaurants', JSON.stringify(localCache.restaurants));
      console.log('Обновлены данные ресторанов в реальном времени');
    });
    
    // Слушатель для категорий
    database.ref('categories').on('value', snapshot => {
      const data = snapshot.val() || {};
      localCache.categories = Object.values(data);
      originalSetItem('categories', JSON.stringify(localCache.categories));
      console.log('Обновлены данные категорий в реальном времени');
    });
    
    // Слушатель для продуктов
    database.ref('products').on('value', snapshot => {
      const data = snapshot.val() || {};
      localCache.products = Object.values(data);
      originalSetItem('products', JSON.stringify(localCache.products));
      console.log('Обновлены данные продуктов в реальном времени');
    });
    
    // Слушатель для заказов
    database.ref('orders').on('value', snapshot => {
      const data = snapshot.val() || {};
      localCache.orders = Object.values(data);
      originalSetItem('orders', JSON.stringify(localCache.orders));
      console.log('Обновлены данные заказов в реальном времени');
    });
    
    // Слушатель для настроек
    database.ref('settings').on('value', snapshot => {
      const data = snapshot.val() || {};
      localCache.settings = data;
      originalSetItem('settings', JSON.stringify(localCache.settings));
      console.log('Обновлены настройки в реальном времени');
    });
    
    // Слушатель для учетных данных админа
    database.ref('adminCredentials').on('value', snapshot => {
      const data = snapshot.val() || {};
      localCache.adminCredentials = data;
      originalSetItem('adminCredentials', JSON.stringify(localCache.adminCredentials));
      console.log('Обновлены учетные данные админа в реальном времени');
    });
  }
  
  // Сохранение ссылок на оригинальные методы localStorage
const originalGetItem = localStorage.getItem.bind(localStorage);
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);
const originalClear = localStorage.clear.bind(localStorage);
const originalKey = localStorage.key.bind(localStorage);
  
  // Переопределение методов localStorage
  
  // Метод getItem
  localStorage.getItem = function(key) {
    console.log(`localStorage.getItem('${key}')`);
    return originalGetItem(key);
  };
  
  // Метод setItem
  localStorage.setItem = function(key, value) {
    console.log(`localStorage.setItem('${key}', [данные])`);
    
    // Сохранение в оригинальном localStorage
    originalSetItem(key, value);
    
    // Обработка различных типов данных
    try {
      const parsedValue = JSON.parse(value);
      
      switch(key) {
        case 'restaurants':
          // Преобразуем массив в объект с ID в качестве ключей
          const restaurantsObj = {};
          parsedValue.forEach(restaurant => {
            restaurantsObj[restaurant.id] = restaurant;
          });
          
          // Сохраняем в Firebase
          if (isOffline) {
            pendingOperations.push({
              type: 'set',
              path: 'restaurants',
              data: restaurantsObj
            });
          } else {
            database.ref('restaurants').set(restaurantsObj);
          }
          break;
          
        case 'categories':
          const categoriesObj = {};
          parsedValue.forEach(category => {
            categoriesObj[category.id] = category;
          });
          
          if (isOffline) {
            pendingOperations.push({
              type: 'set',
              path: 'categories',
              data: categoriesObj
            });
          } else {
            database.ref('categories').set(categoriesObj);
          }
          break;
          
        case 'products':
          const productsObj = {};
          parsedValue.forEach(product => {
            productsObj[product.id] = product;
          });
          
          if (isOffline) {
            pendingOperations.push({
              type: 'set',
              path: 'products',
              data: productsObj
            });
          } else {
            database.ref('products').set(productsObj);
          }
          break;
          
        case 'orders':
          // Для заказов нам нужно определить, какие заказы новые
          // или изменились для оптимизации обновлений
          const ordersObj = {};
          
          // Получаем существующий массив заказов
          const existingOrders = localCache.orders || [];
          
          parsedValue.forEach(order => {
            // Проверяем, является ли заказ новым или изменился
            const existingOrder = existingOrders.find(o => o.id === order.id);
            const orderChanged = existingOrder && 
              (existingOrder.status !== order.status || 
               JSON.stringify(existingOrder) !== JSON.stringify(order));
            
            if (!existingOrder || orderChanged) {
              // Если заказ новый или изменился, сохраняем его
              if (isOffline) {
                pendingOperations.push({
                  type: 'set',
                  path: `orders/${order.id}`,
                  data: order
                });
              } else {
                database.ref(`orders/${order.id}`).set(order);
              }
            }
            
            ordersObj[order.id] = order;
          });
          
          // Проверяем на удаление заказов
          existingOrders.forEach(existingOrder => {
            const orderStillExists = parsedValue.some(order => order.id === existingOrder.id);
            
            if (!orderStillExists) {
              // Если заказ был удален
              if (isOffline) {
                pendingOperations.push({
                  type: 'remove',
                  path: `orders/${existingOrder.id}`
                });
              } else {
                database.ref(`orders/${existingOrder.id}`).remove();
              }
            }
          });
          
          localCache.orders = parsedValue;
          break;
          
        case 'settings':
          if (isOffline) {
            pendingOperations.push({
              type: 'set',
              path: 'settings',
              data: parsedValue
            });
          } else {
            database.ref('settings').set(parsedValue);
          }
          localCache.settings = parsedValue;
          break;
          
        case 'adminCredentials':
          if (isOffline) {
            pendingOperations.push({
              type: 'set',
              path: 'adminCredentials',
              data: parsedValue
            });
          } else {
            database.ref('adminCredentials').set(parsedValue);
          }
          localCache.adminCredentials = parsedValue;
          break;
          
        // Особая обработка для корзины, которая используется временно
        case 'cart':
          // Не сохраняем корзину в Firebase, так как это временное хранилище
          break;
          
        default:
          // Для неизвестных ключей просто сохраняем как есть
          if (isOffline) {
            pendingOperations.push({
              type: 'set',
              path: key,
              data: parsedValue
            });
          } else {
            database.ref(key).set(parsedValue);
          }
          break;
      }
    } catch (error) {
      // Если не можем распарсить JSON, сохраняем как обычную строку
      console.error(`Ошибка при обработке localStorage.setItem для '${key}':`, error);
      
      // Тем не менее пытаемся сохранить в Firebase
      if (isOffline) {
        pendingOperations.push({
          type: 'set',
          path: key,
          data: value
        });
      } else {
        database.ref(key).set(value);
      }
    }
  };
  
  // Метод removeItem
  localStorage.removeItem = function(key) {
  console.log(`localStorage.removeItem('${key}')`);
  originalRemoveItem(key);
    
    // Удаляем в Firebase
    if (isOffline) {
      pendingOperations.push({
        type: 'remove',
        path: key
      });
    } else {
      database.ref(key).remove();
    }
  };
  
  // Метод clear
  localStorage.clear = function() {
    console.log('localStorage.clear()');
    originalClear();
    
    // Очищаем в Firebase
    if (isOffline) {
      pendingOperations.push({
        type: 'remove',
        path: '/'
      });
    } else {
      // Удаляем каждую запись отдельно для безопасности
      Object.keys(localCache).forEach(key => {
        database.ref(key).remove();
      });
    }
  };
  
  // Остальные методы без изменений
  localStorage.key = originalKey;
  
  Object.defineProperty(localStorage, 'length', {
    get: function() { 
      return localStorage.length; // Используем встроенный механизм
  }
  });
  
  // Сохраняем оригинальный localStorage на случай, если он понадобится
  window.originalLocalStorage = {
    getItem: originalGetItem,
    setItem: originalSetItem,
    removeItem: originalRemoveItem,
    clear: originalClear,
    key: originalKey,
    get length() { return localStorage.length; }
  };
  
  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация storage-adapter.js');
    
    // Загружаем начальные данные
    loadInitialData()
      .then(() => {
        // Настраиваем слушатели для обновлений в реальном времени
        setupRealTimeListeners();
      });
  });
  
  // Также пытаемся инициализировать сразу, на случай если DOMContentLoaded уже сработал
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Документ уже загружен, инициализация немедленно');
    loadInitialData()
      .then(() => {
        setupRealTimeListeners();
      });
  }
})();
