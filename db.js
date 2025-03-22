const db = {
  restaurants: {
    getAll() {
      return firebase.database().ref('restaurants').once('value')
        .then(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) : [];
        });
    },
    
    getActive() {
      return this.getAll().then(restaurants => 
        restaurants.filter(restaurant => restaurant.isActive)
      );
    },
    
    getById(id) {
      return firebase.database().ref(`restaurants/${id}`).once('value')
        .then(snapshot => snapshot.val());
    }
  },
  
  categories: {
    getAll() {
      return firebase.database().ref('categories').once('value')
        .then(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) : [];
        });
    },
    
    getActive() {
      return this.getAll().then(categories => 
        categories.filter(category => category.isActive)
      );
    }
  },
  
  products: {
    getAll() {
      return firebase.database().ref('products').once('value')
        .then(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) : [];
        });
    },
    
    getByRestaurant(restaurantId) {
      return this.getAll().then(products => 
        products.filter(product => 
          product.restaurantIds && product.restaurantIds.includes(restaurantId)
        )
      );
    }
  },
  
  orders: {
    add(orderData) {
      return firebase.database().ref('orders').push(orderData);
    }
  },
  
  cart: {
    get() {
      return JSON.parse(localStorage.getItem('cart') || '{"items":[], "restaurantId": null}');
    },
    
    addItem(productId, quantity = 1) {
      const cart = this.get();
      
      return firebase.database().ref(`products/${productId}`).once('value')
        .then(snapshot => {
          const product = snapshot.val();
          
          if (!product) {
            throw new Error('Product not found');
          }
          
          const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
          
          if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += quantity;
          } else {
            cart.items.push({
              productId,
              name: product.name,
              price: product.price,
              quantity
            });
          }
          
          localStorage.setItem('cart', JSON.stringify(cart));
          return cart;
        });
    },
    
    clear() {
      localStorage.removeItem('cart');
    }
  },
  
  auth: {
    login(username, password) {
      return firebase.database().ref('adminCredentials').once('value')
        .then(snapshot => {
          const credentials = snapshot.val() || {};
          
          if (credentials.username === username && credentials.password === password) {
            sessionStorage.setItem('adminSession', Date.now().toString());
            return true;
          }
          
          return false;
        });
    },
    
    logout() {
      sessionStorage.removeItem('adminSession');
    },
    
    isAuthenticated() {
      return !!sessionStorage.getItem('adminSession');
    }
  }
};

window.db = db;
