import { useState, useEffect, useRef } from "react"
import axios from "axios"

// Set backend URL with enhanced configuration
axios.defaults.baseURL = "https://mcab.onrender.com"
axios.defaults.timeout = 30000

// Add request interceptor for better error handling
axios.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error("❌ Request error:", error)
    return Promise.reject(error)
  }
)

// Add response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from: ${response.config.url}`, response.status)
    return response
  },
  (error) => {
    console.error("❌ Response error:", error.message)
    if (error.code === 'ECONNREFUSED') {
      console.error("🔌 Backend server is not running! Please start the backend.")
    }
    return Promise.reject(error)
  }
)

// Toast Notification Component
const ToastNotification = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-50 max-w-full sm:max-w-sm w-full bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border-l-4 p-4 sm:p-6 transform transition-all duration-500 ease-in-out animate-slide-in";
    
    const typeStyles = {
      success: "border-green-500 bg-green-50",
      error: "border-red-500 bg-red-50",
      warning: "border-yellow-500 bg-yellow-50",
      info: "border-blue-500 bg-blue-50"
    };

    return `${baseStyles} ${typeStyles[type]}`;
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    };
    return icons[type];
  };

  const getTitle = () => {
    const titles = {
      success: "Success!",
      error: "Error!",
      warning: "Warning!",
      info: "Info"
    };
    return titles[type];
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 text-xl sm:text-2xl">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base sm:text-lg font-bold text-gray-900">
              {getTitle()}
            </h4>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-3 sm:ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 bg-transparent border-none cursor-pointer text-lg sm:text-xl font-bold w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-200 min-h-[24px] min-w-[24px]"
            >
              ×
            </button>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {message}
          </p>
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-4000 ease-linear"
              style={{ 
                width: '100%',
                backgroundColor: type === 'success' ? '#10b981' : 
                               type === 'error' ? '#ef4444' : 
                               type === 'warning' ? '#f59e0b' : '#3b82f6'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Manager Component
const ToastManager = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-50 space-y-4">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

// Product Detail Modal Component
const ProductDetailModal = ({ product, onClose, addToCart }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '')
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
  const [quantity, setQuantity] = useState(1)

  const addToCartWithVariants = () => {
    const productWithVariants = {
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity
    }
    addToCart(productWithVariants)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-full mx-2 sm:mx-4 w-full max-h-[95vh] my-4 overflow-y-auto relative shadow-2xl border border-gray-200 animate-slide-in">
        <button 
          className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-gray-100 border-none text-xl sm:text-2xl cursor-pointer text-gray-500 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:rotate-90 min-h-[32px] min-w-[32px]"
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-start">
          <div className="flex flex-col gap-3 sm:gap-4">
            {product.photos && product.photos.map((photo, index) => (
              <img 
                key={index} 
                src={photo} 
                alt={product.name}
                className="w-full rounded-lg sm:rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
              />
            ))}
          </div>
          
          <div className="flex flex-col gap-4 sm:gap-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h2>
            <p className="text-red-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">{product.category}</p>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-500">DA{product.price}</p>
            
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Color:</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 bg-white rounded-lg cursor-pointer transition-all duration-300 text-xs sm:text-sm font-medium min-h-[44px] ${
                        selectedColor === color 
                          ? 'bg-red-500 text-white border-red-500 shadow-md' 
                          : 'hover:border-red-300 hover:-translate-y-[2px]'
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Size:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 bg-white rounded-lg cursor-pointer transition-all duration-300 text-xs sm:text-sm font-medium min-h-[44px] ${
                        selectedSize === size 
                          ? 'bg-red-500 text-white border-red-500 shadow-md' 
                          : 'hover:border-red-300 hover:-translate-y-[2px]'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selection */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <label className="font-semibold text-gray-900 text-sm sm:text-base">Quantity:</label>
              <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 w-fit">
                <button 
                  className="bg-white border border-gray-200 w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center font-semibold text-base sm:text-lg hover:bg-red-500 hover:text-white hover:border-red-500 min-h-[32px] min-w-[32px]"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="font-bold text-base sm:text-lg min-w-[2rem] sm:min-w-[3rem] text-center text-gray-900">{quantity}</span>
                <button 
                  className="bg-white border border-gray-200 w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center font-semibold text-base sm:text-lg hover:bg-red-500 hover:text-white hover:border-red-500 min-h-[32px] min-w-[32px]"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              className="bg-red-500 text-white border-none px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg cursor-pointer transition-all duration-300 mt-4 shadow-lg hover:bg-green-500 hover:-translate-y-[2px] hover:shadow-xl w-full min-h-[44px]"
              onClick={addToCartWithVariants}
            >
              Add to Cart - DA{product.price * quantity}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Component
const Cart = ({ cart, setCart, setShowCart, setShowCheckout }) => {
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map(item => 
      item._id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId))
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-full mx-2 sm:mx-4 w-full max-h-[95vh] my-4 overflow-y-auto relative shadow-2xl border border-gray-200 animate-slide-in">
        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart ({cart.length})</h2>
          <button 
            className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-gray-100 border-none text-xl sm:text-2xl cursor-pointer text-gray-500 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:rotate-90 min-h-[32px] min-w-[32px]"
            onClick={() => setShowCart(false)}
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col gap-3 sm:gap-4 max-h-64 sm:max-h-96 overflow-y-auto mb-4 sm:mb-6">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 items-center transition-all duration-300 hover:-translate-y-[2px] hover:shadow-md">
                <img src={item.photos?.[0]} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 truncate">{item.name}</h4>
                  <p className="text-red-500 font-semibold text-sm sm:text-base">DA{item.price}</p>
                  {item.color && <p className="text-gray-600 text-xs sm:text-sm">Color: {item.color}</p>}
                  {item.size && <p className="text-gray-600 text-xs sm:text-sm">Size: {item.size}</p>}
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-gray-200">
                  <button 
                    className="bg-white border border-gray-200 w-6 h-6 sm:w-8 sm:h-8 rounded cursor-pointer transition-all duration-300 flex items-center justify-center text-xs sm:text-sm font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 min-h-[24px] min-w-[24px]"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="font-bold text-xs sm:text-sm min-w-[2rem] text-center text-gray-900">{item.quantity}</span>
                  <button 
                    className="bg-white border border-gray-200 w-6 h-6 sm:w-8 sm:h-8 rounded cursor-pointer transition-all duration-300 flex items-center justify-center text-xs sm:text-sm font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 min-h-[24px] min-w-[24px]"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="bg-red-500 text-white border-none w-6 h-6 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center text-sm sm:text-lg font-semibold hover:bg-red-600 hover:scale-110 min-h-[24px] min-w-[24px]"
                  onClick={() => removeFromCart(item._id)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t-2 border-gray-200 pt-4 sm:pt-6">
            <div className="text-center text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Total: DA{cartTotal}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                className="flex-1 bg-gray-100 text-gray-900 border-2 border-gray-200 px-4 py-3 sm:px-6 sm:py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-200 hover:-translate-y-[1px] min-h-[44px]"
                onClick={() => setShowCart(false)}
              >
                Continue Shopping
              </button>
              <button 
                className="flex-1 bg-green-500 text-white border-none px-4 py-3 sm:px-6 sm:py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-md hover:bg-green-600 hover:-translate-y-[1px] hover:shadow-lg min-h-[44px]"
                onClick={() => { setShowCart(false); setShowCheckout(true); }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Checkout Component
const Checkout = ({ 
  cart, 
  setCart, 
  setShowCheckout, 
  wilayas, 
  handleCheckout 
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    wilaya: '',
    address: '',
    phone: '',
    email: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const orders = cart.map(item => ({
      productId: item._id,
      productName: item.name,
      productPrice: item.price,
      productPhotos: item.photos,
      clientName: formData.clientName,
      wilaya: formData.wilaya,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    }))

    try {
      await Promise.all(orders.map(order => handleCheckout(order)))
      setCart([])
      setShowCheckout(false)
    } catch (error) {
      // Toast will be shown from handleCheckout function
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-full mx-2 sm:mx-4 w-full max-h-[95vh] my-4 overflow-y-auto relative shadow-2xl border border-gray-200 animate-slide-in">
        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h2>
          <button 
            className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-gray-100 border-none text-xl sm:text-2xl cursor-pointer text-gray-500 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:rotate-90 min-h-[32px] min-w-[32px]"
            onClick={() => setShowCheckout(false)}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="font-semibold text-gray-900 text-xs sm:text-sm">Full Name *</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              required
              className="px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white font-inherit focus:outline-none focus:border-red-500 focus:shadow-lg focus:-translate-y-[1px]"
            />
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="font-semibold text-gray-900 text-xs sm:text-sm">Wilaya *</label>
            <select
              name="wilaya"
              value={formData.wilaya}
              onChange={handleInputChange}
              required
              className="px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white font-inherit focus:outline-none focus:border-red-500 focus:shadow-lg focus:-translate-y-[1px]"
            >
              <option value="">Select Wilaya</option>
              {wilayas.map(wilaya => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="font-semibold text-gray-900 text-xs sm:text-sm">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              rows="3"
              className="px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white font-inherit focus:outline-none focus:border-red-500 focus:shadow-lg focus:-translate-y-[1px] resize-vertical"
            />
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="font-semibold text-gray-900 text-xs sm:text-sm">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white font-inherit focus:outline-none focus:border-red-500 focus:shadow-lg focus:-translate-y-[1px]"
            />
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="font-semibold text-gray-900 text-xs sm:text-sm">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white font-inherit focus:outline-none focus:border-red-500 focus:shadow-lg focus:-translate-y-[1px]"
            />
          </div>
          
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h3>
            {cart.map(item => (
              <div key={item._id} className="flex justify-between py-2 sm:py-3 border-b border-gray-200 font-medium text-sm sm:text-base">
                <span className="truncate">{item.name} x {item.quantity}</span>
                <span className="whitespace-nowrap">DA{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-gray-200 text-lg sm:text-xl font-bold text-gray-900">
              <strong>Total: DA{cart.reduce((total, item) => total + (item.price * item.quantity), 0)}</strong>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="bg-red-500 text-white border-none px-6 py-4 sm:px-8 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg cursor-pointer transition-all duration-300 mt-4 shadow-lg hover:bg-green-500 hover:-translate-y-[2px] hover:shadow-xl min-h-[44px]"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  )
}

// Footer Component
const Footer = ({ setPage, setShowContactModal, setShowHelpModal, handleCall, handleFindStore }) => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-12 sm:py-16 max-w-6xl mx-auto">
        <div className="text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">MCA SHOP</h3>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">Official merchandise store of Mouloudia Club d'Alger</p>
        </div>
        
        <div className="text-center md:text-left">
          <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <button 
              onClick={() => setPage('store')}
              className="bg-transparent border-none text-gray-300 cursor-pointer py-1 sm:py-2 text-left transition-all duration-300 relative overflow-hidden hover:text-white hover:translate-x-2 text-sm sm:text-base"
            >
              Store
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="bg-transparent border-none text-gray-300 cursor-pointer py-1 sm:py-2 text-left transition-all duration-300 relative overflow-hidden hover:text-white hover:translate-x-2 text-sm sm:text-base"
            >
              Contact
            </button>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="bg-transparent border-none text-gray-300 cursor-pointer py-1 sm:py-2 text-left transition-all duration-300 relative overflow-hidden hover:text-white hover:translate-x-2 text-sm sm:text-base"
            >
              Help
            </button>
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Info</h4>
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <button 
              onClick={handleCall}
              className="bg-transparent border-none text-gray-300 cursor-pointer py-1 sm:py-2 text-left transition-all duration-300 relative overflow-hidden hover:text-white hover:translate-x-2 text-sm sm:text-base"
            >
              📞 +213 771 23 45 67
            </button>
            <button 
              onClick={handleFindStore}
              className="bg-transparent border-none text-gray-300 cursor-pointer py-1 sm:py-2 text-left transition-all duration-300 relative overflow-hidden hover:text-white hover:translate-x-2 text-sm sm:text-base"
            >
              📍 Stade 5 Juillet 1962, Algiers
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 py-6 sm:py-8 px-4 sm:px-8 text-center text-gray-500 text-xs sm:text-sm">
        <p>&copy; 2025 MCA Shop. All rights reserved.</p>
      </div>
    </footer>
  )
}

// Dashboard Component
const Dashboard = ({ 
  isAdmin, 
  productName, setProductName,
  productDescription, setProductDescription,
  productPrice, setProductPrice,
  productCategory, setProductCategory,
  productPhotos, setProductPhotos,
  fetchProducts,
  dashboardStats,
  backendStatus,
  showSuccessMessage,
  setShowSuccessMessage,
  handleDeleteProduct,
  products
}) => {
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add color
  const addColor = () => {
    if (colorInput.trim() && !selectedColors.includes(colorInput.trim())) {
      setSelectedColors([...selectedColors, colorInput.trim()]);
      setColorInput("");
    }
  };

  // Remove color
  const removeColor = (colorToRemove) => {
    setSelectedColors(selectedColors.filter(color => color !== colorToRemove));
  };

  // Add size
  const addSize = () => {
    if (sizeInput.trim() && !selectedSizes.includes(sizeInput.trim())) {
      setSelectedSizes([...selectedSizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  // Remove size
  const removeSize = (sizeToRemove) => {
    setSelectedSizes(selectedSizes.filter(size => size !== sizeToRemove));
  };

  // Fix the photo upload handler
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length !== files.length) {
      // Toast will be shown from the calling function
    }
    
    setProductPhotos(validFiles);
    console.log("Selected files:", validFiles.length);
  };

  // FIXED: handleAddProduct with proper form prevention
  const handleAddProduct = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAdmin) {
      // Toast will be shown from the calling function
      return;
    }

    // Validation
    if (!productName || !productDescription || !productPrice || !productCategory || productPhotos.length === 0) {
      // Toast will be shown from the calling function
      return;
    }

    console.log("🔄 Starting product creation...");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("price", productPrice);
    formData.append("category", productCategory);
    formData.append("colors", selectedColors.join(','));
    formData.append("sizes", selectedSizes.join(','));
    
    // Append each photo file
    productPhotos.forEach(photo => {
      formData.append("photos", photo);
    });

    try {
      console.log("📤 Sending request to backend...");
      const response = await axios.post("/api/admin/products", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("✅ Backend response:", response);
      
      if (response.status === 201) {
        // Toast will be shown from the calling function
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        
        // Reset form
        setProductName("");
        setProductDescription("");
        setProductPrice("");
        setProductCategory("");
        setSelectedColors([]);
        setSelectedSizes([]);
        setProductPhotos([]);
        setColorInput("");
        setSizeInput("");
        
        // Refresh products list
        console.log("🔄 Refreshing products list...");
        await fetchProducts();
      }
    } catch (error) {
      console.error("❌ Error adding product:", error);
      // Toast will be shown from the calling function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b-2 border-gray-200">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard Home</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button 
            className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:bg-green-500 hover:-translate-y-[2px] hover:shadow-md text-sm sm:text-base min-h-[44px]"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
          <button 
            onClick={fetchProducts}
            className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:bg-green-500 hover:-translate-y-[2px] hover:shadow-md text-sm sm:text-base min-h-[44px]"
          >
            Refresh Products List
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {backendStatus === "disconnected" && (
        <div className="bg-yellow-100 text-yellow-800 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-yellow-300 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base">
          ⚠️ Backend server is not connected. Hero content management will not work.
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-100 text-green-800 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-300 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base">
          ✅ Product created successfully! Check the "Current Products" section below.
        </div>
      )}

      {/* New Orders Section */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">New Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200">
            <span className="text-gray-600 text-xs sm:text-sm font-semibold block mb-2">Pending Orders</span>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardStats.pendingOrders}</span>
          </div>
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200">
            <span className="text-gray-600 text-xs sm:text-sm font-semibold block mb-2">Total Products</span>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardStats.totalProducts}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[
            { label: "Total Revenue", value: `DA${dashboardStats.totalRevenue.toLocaleString()}`, change: dashboardStats.revenueChange, trend: "Total revenue from orders" },
            { label: "New Customers", value: dashboardStats.newCustomers.toLocaleString(), change: dashboardStats.customersChange, trend: "Unique customers" },
            { label: "Active Accounts", value: dashboardStats.activeAccounts.toLocaleString(), change: dashboardStats.accountsChange, trend: "Customer engagement" },
            { label: "Growth Rate", value: `${dashboardStats.growthRate}%`, change: dashboardStats.growthChange, trend: "Business growth" }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 transition-all duration-300 hover:-translate-y-[4px] hover:shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-gray-600 text-xs sm:text-sm font-semibold uppercase tracking-wider">{stat.label}</h3>
                <span className={`text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full ${
                  stat.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}%
                </span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
              <div className="text-gray-500 text-xs sm:text-sm">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Add Product Section */}
        <div className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-gray-200">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Add New Product</h3>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleAddProduct}>
            <div className="flex flex-col gap-2 sm:gap-3">
              <label className="font-semibold text-gray-900 text-sm sm:text-base">Product Name *</label>
              <input
                type="text"
                className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex flex-col gap-2 sm:gap-3">
              <label className="font-semibold text-gray-900 text-sm sm:text-base">Description *</label>
              <textarea
                className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg resize-vertical"
                placeholder="Product Details/Description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                required
                rows="3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Price (DA) *</label>
                <input
                  type="number"
                  className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg"
                  placeholder="Price"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Category *</label>
                <select
                  className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  <option value="Jerseys">Jerseys</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Stickers">Stickers</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Bags">Bags</option>
                </select>
              </div>
            </div>

            {/* Colors Management */}
            <div className="border-2 border-dashed border-gray-300 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-white transition-all duration-300 hover:border-red-300">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Colors</h4>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500"
                  placeholder="Add color (e.g., Red, Green, Blue)"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-green-500 hover:-translate-y-[1px] whitespace-nowrap text-sm sm:text-base min-h-[44px]"
                  onClick={addColor}
                  disabled={isSubmitting}
                >
                  + Add Color
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedColors.map((color, index) => (
                  <span key={index} className="inline-flex items-center bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium gap-1 sm:gap-2 shadow-sm">
                    {color}
                    <button 
                      type="button" 
                      onClick={() => removeColor(color)}
                      disabled={isSubmitting}
                      className="opacity-70 hover:opacity-100 transition-opacity duration-300 text-xs sm:text-base"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes Management */}
            <div className="border-2 border-dashed border-gray-300 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-white transition-all duration-300 hover:border-red-300">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Sizes</h4>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500"
                  placeholder="Add size (e.g., S, M, L, XL)"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-green-500 hover:-translate-y-[1px] whitespace-nowrap text-sm sm:text-base min-h-[44px]"
                  onClick={addSize}
                  disabled={isSubmitting}
                >
                  + Add Size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSizes.map((size, index) => (
                  <span key={index} className="inline-flex items-center bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium gap-1 sm:gap-2 shadow-sm">
                    {size}
                    <button 
                      type="button" 
                      onClick={() => removeSize(size)}
                      disabled={isSubmitting}
                      className="opacity-70 hover:opacity-100 transition-opacity duration-300 text-xs sm:text-base"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="border-2 border-dashed border-gray-300 p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl bg-white text-center transition-all duration-300 hover:border-red-500 hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Product Photos *</h4>
              <div className="p-4 sm:p-6 md:p-8 rounded-lg transition-all duration-300 hover:bg-black hover:bg-opacity-5">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-gray-600 text-sm sm:text-base">📷 Select product photos</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Maximum 10 images</p>
                  <button 
                    type="button" 
                    className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 font-semibold mt-3 sm:mt-4 shadow-md hover:bg-green-500 hover:-translate-y-[2px] hover:shadow-lg text-sm sm:text-base min-h-[44px]"
                    onClick={() => document.getElementById('product-photos-input')?.click()}
                    disabled={isSubmitting}
                  >
                    Browse Files
                  </button>
                </div>
                <input
                  type="file"
                  id="product-photos-input"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Show selected files preview */}
              {productPhotos.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Selected photos: {productPhotos.length}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {productPhotos.map((photo, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg">
                        <img 
                          src={URL.createObjectURL(photo)} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-16 sm:h-20 md:h-24 object-cover"
                        />
                        <span className="text-xs text-gray-600 truncate block p-1 sm:p-2">{photo.name}</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newPhotos = [...productPhotos];
                            newPhotos.splice(index, 1);
                            setProductPhotos(newPhotos);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white border-none w-5 h-5 sm:w-6 sm:h-6 rounded-full cursor-pointer text-xs font-semibold flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:scale-110 min-h-[20px] min-w-[20px]"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-red-500 text-white border-none px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg cursor-pointer transition-all duration-300 shadow-lg hover:bg-green-500 hover:-translate-y-[2px] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Product...' : 'Save Product'}
            </button>
          </form>
        </div>

        {/* Current Products Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Current Products ({products.length})</h3>
            <button 
              className="bg-gray-100 text-gray-900 border border-gray-200 px-3 py-2 sm:px-4 sm:py-2 rounded-lg cursor-pointer transition-all duration-300 font-medium hover:bg-gray-200 hover:-translate-y-[1px] text-sm sm:text-base min-h-[44px]"
              onClick={fetchProducts}
            >
              🔄 Refresh List
            </button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-sm sm:text-base">No products found. Create your first product above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md flex flex-col gap-3 sm:gap-4">
                  {product.photos && product.photos.length > 0 ? (
                    <img
                      src={product.photos[0]}
                      alt={product.name}
                      className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-semibold text-sm sm:text-base">
                      📷 No Image
                    </div>
                  )}
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg">{product.name}</h4>
                    <p className="text-red-500 text-xs sm:text-sm font-semibold">{product.category}</p>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{product.description}</p>
                    <p className="text-red-500 font-bold text-base sm:text-lg">DA{product.price}</p>
                    {product.colors && product.colors.length > 0 && (
                      <p className="text-gray-700 text-xs sm:text-sm"><strong>Colors:</strong> {product.colors.join(', ')}</p>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <p className="text-gray-700 text-xs sm:text-sm"><strong>Sizes:</strong> {product.sizes.join(', ')}</p>
                    )}
                    <p className="text-gray-700 text-xs sm:text-sm"><strong>Photos:</strong> {product.photos ? product.photos.length : 0}</p>
                  </div>
                  <button
                    className="bg-red-500 text-white border-none px-3 py-2 sm:px-4 sm:py-2 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-red-600 hover:translate-y-[-1px] hover:shadow-md self-start disabled:opacity-50 text-xs sm:text-base min-h-[44px]"
                    onClick={() => handleDeleteProduct(product._id)}
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Hero Content Management Component
const HeroContentManager = ({ backendStatus }) => {
  const [heroContents, setHeroContents] = useState([]);
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroButtonText, setHeroButtonText] = useState("Shop Now");
  const [heroTheme, setHeroTheme] = useState("light");
  const [heroOrder, setHeroOrder] = useState(0);
  const [heroMedia, setHeroMedia] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [heroIsActive, setHeroIsActive] = useState(true);

  // Fetch hero content
  const fetchHeroContent = async () => {
    try {
      console.log("📋 Fetching hero content for management...");
      const response = await axios.get("/api/admin/hero-content");
      console.log("🛰️ Raw hero response:", response);

      // Normalize different possible response shapes from backend
      const payload = response.data;
      let items = [];

      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload.data)) {
        items = payload.data;
      } else if (Array.isArray(payload.heroContents)) {
        items = payload.heroContents;
      } else if (Array.isArray(payload.items)) {
        items = payload.items;
      } else if (payload && typeof payload === 'object' && Object.keys(payload).length === 0) {
        items = [];
      } else if (payload) {
        // Fallback: if payload looks like a single item, wrap it
        if (payload._id || payload.id || payload.title) items = [payload];
      }

      setHeroContents(items);
      console.log("✅ Hero content loaded for management:", items.length, "items");
    } catch (error) {
      console.error("❌ Error fetching hero content:", error);
      alert("Error fetching hero content: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    fetchHeroContent();
  }, []);

  // Handle media file selection
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📁 File selected:", file.name, "Type:", file.type);

    // Determine media type
    if (file.type.startsWith('video/')) {
      setMediaType("video");
    } else if (file.type.startsWith('image/')) {
      setMediaType("image");
    } else {
      // Toast will be shown from the calling function
      return;
    }

    setHeroMedia(file);
  };

  // Enhanced form submission with better error handling
  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!heroTitle || !heroTitle.trim()) {
      // Toast will be shown from the calling function
      return;
    }

    if (!heroSubtitle || !heroSubtitle.trim()) {
      // Toast will be shown from the calling function
      return;
    }

    if (!heroMedia && !editingContent) {
      // Toast will be shown from the calling function
      return;
    }

    if (!mediaType && !editingContent) {
      // Toast will be shown from the calling function
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", heroTitle.trim());
    formData.append("subtitle", heroSubtitle.trim());
    formData.append("buttonText", heroButtonText);
    formData.append("theme", heroTheme);
    formData.append("order", heroOrder.toString());
    formData.append("isActive", heroIsActive.toString());
    formData.append("mediaType", mediaType);
    
    // Append the single media file
    if (heroMedia) {
      formData.append("media", heroMedia);
    }

    try {
      console.log("📤 Sending hero content to backend...");
      
      const endpoint = editingContent 
        ? `/api/admin/hero-content/${editingContent._id}`
        : "/api/admin/hero-content";

      const method = editingContent ? "put" : "post";

      const response = await axios[method](endpoint, formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
        timeout: 30000
      });

      console.log("✅ Hero content saved successfully:", response.data);
      
      // If backend returned the created/updated item, append it to the list quickly
      try {
        const created = response.data?.data || response.data;
        if (created && (created._id || created.id)) {
          // refresh list or optimistically add
          await fetchHeroContent();
        } else {
          await fetchHeroContent();
        }
      } catch (e) {
        console.warn('Could not normalize created hero content:', e);
        await fetchHeroContent();
      }
      resetHeroForm();
      fetchHeroContent();
      setShowHeroForm(false);
      
    } catch (error) {
      console.error("❌ Error saving hero content:", error);
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        // Toast will be shown from the calling function
      } else if (error.response?.data?.message) {
        // Toast will be shown from the calling function
      } else {
        // Toast will be shown from the calling function
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetHeroForm = () => {
    setHeroTitle("");
    setHeroSubtitle("");
    setHeroButtonText("Shop Now");
    setHeroTheme("light");
    setHeroOrder(0);
    setHeroMedia(null);
    setMediaType("");
    setHeroIsActive(true);
    setEditingContent(null);
    setIsSubmitting(false);
  };

  // Edit content
  const editContent = (content) => {
    console.log("✏️ Editing hero content:", content._id);
    setEditingContent(content);
    setHeroTitle(content.title);
    setHeroSubtitle(content.subtitle);
    setHeroButtonText(content.buttonText);
    setHeroTheme(content.theme);
    setHeroOrder(content.order);
    setHeroIsActive(content.isActive);
    setMediaType(content.mediaType);
    setShowHeroForm(true);
  };

  // Delete content
  const deleteContent = async (id) => {
    if (window.confirm("Are you sure you want to delete this hero content?")) {
      try {
        console.log("🗑️ Deleting hero content:", id);
        await axios.delete(`/api/admin/hero-content/${id}`);
        fetchHeroContent();
        alert('Hero content deleted successfully');
      } catch (error) {
        console.error("❌ Error deleting hero content:", error);
        alert('Error deleting hero content: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Hero Content Management</h3>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            className="bg-gray-100 text-gray-900 border border-gray-200 px-3 py-2 sm:px-4 sm:py-2 rounded-lg cursor-pointer transition-all duration-300 font-medium hover:bg-gray-200 hover:translate-y-[-1px] text-sm sm:text-base min-h-[44px]"
            onClick={fetchHeroContent}
          >
            🔄 Refresh
          </button>
          <button 
            className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:bg-green-500 hover:translate-y-[-2px] hover:shadow-md text-sm sm:text-base min-h-[44px]"
            onClick={() => setShowHeroForm(true)}
          >
            + Add New Hero Content
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {backendStatus === "disconnected" && (
        <div className="bg-yellow-100 text-yellow-800 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-yellow-300 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base">
          ⚠️ Backend server is not connected. Please make sure the backend is running on http://localhost:5410
        </div>
      )}

      {/* Hero Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {heroContents.length === 0 ? (
          <div className="col-span-2 text-center py-8 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-sm sm:text-base">No hero content found. Create your first hero content!</p>
          </div>
        ) : (
          heroContents.map((content) => (
            <div key={content._id} className="bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
              <div className="flex flex-col">
                <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                  {content.mediaType === "video" ? (
                    <div className="relative w-full h-full">
                      <video src={content.mediaUrl} muted className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black bg-opacity-80 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold uppercase tracking-wider">VIDEO</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black bg-opacity-80 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold uppercase tracking-wider">IMAGE</span>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2">{content.title}</h4>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{content.subtitle}</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${content.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {content.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">📋 Order: {content.order}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">🎨 Theme: {content.theme}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">📹 Type: {content.mediaType}</span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-gray-100 border-t border-gray-200 flex gap-2 sm:gap-3">
                  <button 
                    className="flex-1 bg-red-500 text-white border-none px-3 py-2 sm:px-4 sm:py-2 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-green-500 hover:translate-y-[-1px] text-xs sm:text-base min-h-[44px]"
                    onClick={() => editContent(content)}
                  >
                    Edit
                  </button>
                  <button 
                    className="flex-1 bg-red-600 text-white border-none px-3 py-2 sm:px-4 sm:py-2 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-red-700 hover:translate-y-[-1px] text-xs sm:text-base min-h-[44px]"
                    onClick={() => deleteContent(content._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hero Content Form Modal */}
      {showHeroForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-full mx-2 sm:mx-4 w-full max-h-[95vh] my-4 overflow-y-auto relative shadow-2xl border border-gray-200 animate-slide-in">
            <button 
              className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-gray-100 border-none text-xl sm:text-2xl cursor-pointer text-gray-500 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:rotate-90 disabled:opacity-50 min-h-[32px] min-w-[32px]"
              onClick={() => { 
                setShowHeroForm(false); 
                resetHeroForm(); 
              }}
              disabled={isSubmitting}
            >
              ×
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              {editingContent ? 'Edit Hero Content' : 'Add New Hero Content'}
            </h2>

            <form className="space-y-4 sm:space-y-6" onSubmit={handleHeroSubmit}>
              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Title *</label>
                <input
                  type="text"
                  className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg disabled:opacity-50"
                  placeholder="e.g., OFFICIAL MCA COLLECTION"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Subtitle *</label>
                <textarea
                  className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg resize-vertical disabled:opacity-50"
                  placeholder="e.g., Authentic Jerseys & Stadium Merchandise"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  required
                  rows="2"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="font-semibold text-gray-900 text-sm sm:text-base">Button Text</label>
                  <input
                    type="text"
                    className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg disabled:opacity-50"
                    placeholder="e.g., Shop Now"
                    value={heroButtonText}
                    onChange={(e) => setHeroButtonText(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="font-semibold text-gray-900 text-sm sm:text-base">Theme</label>
                  <select
                    className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg disabled:opacity-50"
                    value={heroTheme}
                    onChange={(e) => setHeroTheme(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="font-semibold text-gray-900 text-sm sm:text-base">Order</label>
                  <input
                    type="number"
                    className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg disabled:opacity-50"
                    value={heroOrder}
                    onChange={(e) => setHeroOrder(parseInt(e.target.value) || 0)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Single Media Upload Section */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Media File (Video or Image) {!editingContent && '*'}</label>
                <div className="border-2 border-dashed border-gray-300 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-white text-center transition-all duration-300 hover:border-red-500">
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-gray-600 text-sm sm:text-base">🎬📷 Select a video OR image file</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Choose either a video file or an image file</p>
                    {heroMedia && (
                      <p className="text-green-600 text-xs sm:text-sm font-medium">
                        ✅ Selected: {heroMedia.name} ({mediaType})
                      </p>
                    )}
                    {editingContent?.mediaUrl && !heroMedia && (
                      <p className="text-gray-600 text-xs sm:text-sm">
                        📁 Current: {editingContent.mediaUrl.split('/').pop()} ({editingContent.mediaType})
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    id="hero-media-input"
                    className="hidden"
                    accept="video/*,image/*"
                    onChange={handleMediaChange}
                    required={!editingContent}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 font-semibold mt-3 sm:mt-4 shadow-md hover:bg-green-500 hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-50 text-sm sm:text-base min-h-[44px]"
                    onClick={() => document.getElementById('hero-media-input')?.click()}
                    disabled={isSubmitting}
                  >
                    {heroMedia ? 'Change File' : 'Browse Files'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  checked={heroIsActive}
                  onChange={(e) => setHeroIsActive(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 rounded focus:ring-red-500 disabled:opacity-50"
                />
                <label className="font-semibold text-gray-900 text-sm sm:text-base">Active (Show on website)</label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 text-gray-900 border-2 border-gray-200 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-200 hover:translate-y-[-1px] disabled:opacity-50 text-sm sm:text-base min-h-[44px]"
                  onClick={() => { setShowHeroForm(false); resetHeroForm(); }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-red-500 text-white border-none px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-md hover:bg-green-500 hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-50 text-sm sm:text-base min-h-[44px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingContent ? 'Update Content' : 'Create Content')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// FIXED VideoHero Component - No more disappearing issues
const VideoHero = ({ setShowCart }) => {
  const [heroContents, setHeroContents] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  // Static fallback content
  const staticHeroContent = [
    {
      _id: '1',
      title: "OFFICIAL MCA COLLECTION",
      subtitle: "Authentic Jerseys & Stadium Merchandise",
      buttonText: "Shop Now",
      mediaUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      mediaType: "image",
      theme: "light",
      isActive: true
    }
  ];

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/public/hero-content");
        if (response.data && response.data.length > 0) {
          setHeroContents(response.data);
        } else {
          setHeroContents(staticHeroContent);
        }
      } catch (error) {
        console.error("Error fetching hero content, using fallback:", error);
        setHeroContents(staticHeroContent);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  // Stop auto-advance on resize to prevent issues
  useEffect(() => {
    const handleResize = () => {
      clearInterval(timeoutRef.current);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timeoutRef.current);
    };
  }, []);

  // Simple navigation
  const nextVideo = () => {
    setCurrent((c) => (c + 1) % heroContents.length);
  };

  const prevVideo = () => {
    setCurrent((c) => (c - 1 + heroContents.length) % heroContents.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (loading) {
    return (
      <div className="relative h-64 md:h-96 bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hero content...</p>
        </div>
      </div>
    );
  }

  const currentContent = heroContents[current];

  return (
    <div className="relative w-full h-64 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden bg-red-500">
      <div className="relative w-full h-full">
        {heroContents.map((content, i) => (
          <div
            key={content._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            {content.mediaType === "video" ? (
              <video
                src={content.mediaUrl}
                muted={isMuted}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Video failed to load:", content.mediaUrl);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <img 
                src={content.mediaUrl} 
                alt={content.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", content.mediaUrl);
                  e.target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className={`absolute inset-0 flex items-center px-4 sm:px-8 md:px-16 bg-gradient-to-br from-black/60 to-black/30 text-white`}>
        <div className="max-w-full sm:max-w-2xl z-10 w-full">
          <div className="inline-flex items-center bg-white/95 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4 shadow-lg backdrop-blur-sm border border-white/20 max-w-full">
            <span className="bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap">1921</span>
            <span className="font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">OFFICIAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight text-white drop-shadow-2xl break-words">
            {currentContent?.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-white/90 leading-relaxed drop-shadow-lg break-words">
            {currentContent?.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button 
              className="bg-red-500 text-white border-none px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg cursor-pointer transition-all duration-300 shadow-lg hover:bg-green-500 hover:-translate-y-[2px] hover:shadow-xl flex items-center gap-2 justify-center min-h-[44px] w-full sm:w-auto"
              onClick={() => setShowCart(true)}
            >
              {currentContent?.buttonText || "Shop Now"}
            </button>
            <button 
              className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-white/20 hover:-translate-y-[2px] hover:border-white/50 hover:shadow-lg min-h-[44px] w-full sm:w-auto"
              onClick={() => document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse All
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {heroContents.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {heroContents.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {heroContents.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white border-none w-10 h-10 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-black/70 hover:scale-110 z-10"
            onClick={prevVideo}
          >
            ‹
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white border-none w-10 h-10 rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-black/70 hover:scale-110 z-10"
            onClick={nextVideo}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [page, setPage] = useState("store")
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminLogin, setAdminLogin] = useState({ username: "", password: "" })

  // Footer modal states
  const [showContactModal, setShowContactModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)

  // Admin form state
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productCategory, setProductCategory] = useState("")
  const [productPhotos, setProductPhotos] = useState([])

  // Cart and order states
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [wilayas, setWilayas] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)

  // Order form state
  const [clientName, setClientName] = useState("")
  const [wilaya, setWilaya] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")

  // Dashboard states
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 1250,
    revenueChange: -12.5,
    newCustomers: 1234,
    customersChange: -20,
    activeAccounts: 45678,
    accountsChange: -12.5,
    growthRate: 4.5,
    growthChange: -4.5,
    pendingOrders: 2,
    totalProducts: 12
  })

  // Backend connection state
  const [backendStatus, setBackendStatus] = useState("checking")
  const [productsLoading, setProductsLoading] = useState(false)

  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  // Header hide/show state
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Add toast function
  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  // Remove toast function
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Enhanced functions with toast notifications
  const addToCartWithToast = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    addToast(
      `${product.name} added to cart! 🛒`,
      'success',
      3000
    );
  };

  const handleCheckoutWithToast = async (orderData) => {
    try {
      const response = await axios.post("/api/public/orders", orderData);
      if (response.data.success) {
        addToast(
          "🎉 Order confirmed successfully! We will contact you soon.",
          'success',
          5000
        );
        setCart([]);
        setShowCheckout(false);
        setShowCart(false);
        setClientName("");
        setWilaya("");
        setAddress("");
        setPhone("");
        setEmail("");
        setSelectedColor("");
        setSelectedSize("");
        // Update dashboard stats
        setDashboardStats(prev => ({
          ...prev,
          pendingOrders: prev.pendingOrders + 1
        }));
      }
    } catch (error) {
      addToast(
        error.response?.data?.message || "There was an error placing your order.",
        'error',
        5000
      );
    }
  };

  const handleUpdateOrderStatusWithToast = async (id, status) => {
    if (!isAdmin) return;

    try {
      await axios.put(`/api/admin/orders/${id}`, { status });
      fetchOrders();
      addToast(
        `Order status updated to ${status} successfully!`,
        'success',
        3000
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      addToast(
        "Error updating order status",
        'error',
        3000
      );
    }
  };

  const handleDeleteProductWithToast = async (id) => {
    if (!isAdmin) {
      addToast("Admin access required!", 'error', 3000);
      return;
    }

    addToast(
      "Are you sure you want to delete this product?",
      'warning',
      5000
    );

    // You can implement a confirmation modal here instead
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/admin/products/${id}`);
        fetchProducts();
        addToast(
          "Product deleted successfully!",
          'success',
          3000
        );
        // Update dashboard stats
        setDashboardStats(prev => ({
          ...prev,
          totalProducts: Math.max(0, prev.totalProducts - 1)
        }));
      } catch (error) {
        console.error("Error deleting product:", error);
        addToast(
          "Error deleting product",
          'error',
          3000
        );
      }
    }
  };

  const handleAdminLoginWithToast = (e) => {
    e.preventDefault();
    if (adminLogin.username === "mcaghassen" && adminLogin.password === "mca2005") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminLogin({ username: "", password: "" });
      setPage("admin");
      fetchOrders();
      fetchDashboardStats();
      window.location.hash = '';
      addToast(
        "Welcome back, Admin! 👋",
        'success',
        3000
      );
    } else {
      addToast(
        "Invalid admin credentials!",
        'error',
        3000
      );
    }
  };

  // Header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle the scroll event for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY]);

  // Test backend connection on component mount
  useEffect(() => {
    testBackendConnection()
  }, [])

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log("🔌 Testing backend connection...")
      const response = await axios.get("/")
      setBackendStatus("connected")
      console.log("✅ Backend connection successful:", response.data)
    } catch (error) {
      setBackendStatus("disconnected")
      console.error("❌ Backend connection failed:", error.message)
    }
  }

  // Handle store location click
  const handleFindStore = () => {
    window.open('https://maps.google.com/?q=Stade+5+Juillet+1962+Algiers+Algeria', '_blank')
  }

  // Handle phone call
  const handleCall = () => {
    window.open('tel:+213771234567')
  }

  // Handle logo click
  const handleLogoClick = () => {
    setPage("store")
    setShowCart(false)
    setShowCheckout(false)
    setSelectedProduct(null)
    window.location.hash = 'store'
  }

  // Check URL hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#mcaadmin2024') {
        setShowAdminLogin(true)
      } else if (window.location.hash === '#store') {
        setPage("store")
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  // Fetch products on load
  useEffect(() => {
    if (backendStatus === "connected") {
      fetchProducts()
      fetchWilayas()
      fetchDashboardStats()
    }
  }, [backendStatus])

  // Fetch wilayas
  const fetchWilayas = async () => {
    try {
      const response = await axios.get("/api/wilayas")
      setWilayas(response.data)
    } catch (error) {
      console.error("Error fetching wilayas:", error)
    }
  }

  // Get all products - ENHANCED
  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      console.log("🔄 Fetching products from backend...")
      const response = await axios.get("/api/public/products")
      console.log("✅ Products fetched:", response.data.length, "products")
      setProducts(response.data)
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      console.error("Error details:", error.response?.data)
      addToast("Error loading products: " + (error.message || "Check console for details"), 'error', 5000)
    } finally {
      setProductsLoading(false)
    }
  }

  // Get all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/admin/orders")
      setOrders(response.data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("/api/admin/dashboard/stats")
      setDashboardStats(response.data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false)
    setPage("store")
    setOrders([])
    window.location.hash = 'store'
    addToast("Logged out successfully", 'success', 3000)
  }

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  // Delete order
  const handleDeleteOrder = async (id) => {
    if (!isAdmin) {
      addToast("Admin access required!", 'error', 3000)
      return
    }

    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`/api/admin/orders/${id}`)
        fetchOrders()
        // Update dashboard stats
        setDashboardStats(prev => ({
          ...prev,
          pendingOrders: Math.max(0, prev.pendingOrders - 1)
        }))
        addToast("Order deleted successfully", 'success', 3000)
      } catch (error) {
        console.error("Error deleting order:", error)
        addToast("Error deleting order", 'error', 3000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      {/* Toast Notifications */}
      <ToastManager toasts={toasts} removeToast={removeToast} />

      {/* Connection Status Indicator */}
      {backendStatus === "disconnected" && (
        <div className="bg-red-100 text-red-800 py-3 sm:py-4 text-center border-b border-red-300 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 font-semibold text-sm sm:text-base">
          ⚠️ Backend server disconnected. Some features may not work. 
          <button 
            onClick={testBackendConnection} 
            className="bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-1 rounded cursor-pointer transition-all duration-300 font-semibold hover:bg-red-600 hover:translate-y-[-1px] text-xs sm:text-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Header with hide/show functionality */}
      <header className={`bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm backdrop-blur-sm border-none transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer transition-all duration-300 hover:translate-y-[-1px]" onClick={handleLogoClick}>
          <img 
            src="/unnamed__1_-removebg-preview.png"
            alt="Mouloudia Shop" 
            className="h-16 sm:h-20 md:h-24 w-auto rounded-md shadow-sm transition-transform duration-300"
          />
          <h1 style={{ fontFamily: '"Rochester", cursive', fontWeight: 400, fontStyle: 'normal', fontSize: '2rem' }}>Mouloudia Shop</h1>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            className={`px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3 border-none rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 relative overflow-hidden min-h-[44px] ${
              page === "store" 
                ? "bg-white/20 text-white border-white/30" 
                : "bg-white/10 text-white backdrop-blur-sm border-white/20"
            } border`}
            onClick={() => setPage("store")}
          >
            Store
          </button>
          
          <button 
            className="bg-white text-red-500 border-2 border-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 relative hover:bg-green-500 hover:text-white hover:border-green-500 hover:translate-y-[-2px] hover:shadow-lg min-h-[44px]"
            onClick={() => setShowCart(true)}
            aria-label="Open cart"
          >
            <span className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6L4 2" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
              </svg>
              <span>Cart ({cart.length})</span>
            </span>
          </button>
          
          {isAdmin && (
            <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
              <button
                className={`px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3 border-none rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 text-xs sm:text-sm min-h-[44px] ${
                  page === "admin" 
                    ? "bg-white/20 text-white border-white/30" 
                    : "bg-white/10 text-white backdrop-blur-sm border-white/20"
                } border`}
                onClick={() => setPage("admin")}
              >
                Admin Panel
              </button>
              <button 
                className="bg-red-600 text-white border-2 border-red-600 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:bg-red-700 hover:border-red-700 hover:translate-y-[-2px] hover:shadow-md text-xs sm:text-sm min-h-[44px]"
                onClick={handleAdminLogout}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      {page === "store" && (
        <div className="store-page flex-1">
          {/* Video Hero Section */}
          <VideoHero setShowCart={setShowCart} />

          <div className="products-section py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gray-50 overflow-x-hidden">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900 relative">
              MCA Collection
              <div className="absolute bottom-[-0.5rem] sm:bottom-[-1rem] left-1/2 transform -translate-x-1/2 w-12 sm:w-16 md:w-20 h-1 bg-red-500 rounded"></div>
            </h2>
            
            {productsLoading ? (
              <div className="flex justify-center items-center py-12 sm:py-16 text-gray-500 flex-col gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin-slow"></div>
                <p className="text-sm sm:text-base">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-sm sm:text-base">No products available. Add some products in the admin panel!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md transition-all duration-400 cursor-pointer border border-gray-200 relative hover:translate-y-[-4px] sm:hover:translate-y-[-8px] hover:shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 transform scale-x-0 transition-transform duration-400 origin-left hover:scale-x-100 z-10"></div>
                    {product.photos && product.photos.length > 0 && (
                      <img
                        src={product.photos[0]}
                        alt={product.name}
                        className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover transition-transform duration-400 hover:scale-105"
                        onClick={() => setSelectedProduct({...product, showDetail: true})}
                      />
                    )}
                    <div className="p-4 sm:p-6">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{product.name}</h4>
                      <p className="text-red-500 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wider">{product.category}</p>
                      <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-xs sm:text-sm line-clamp-2">{product.description}</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6">DA{product.price}</p>
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          className="flex-1 bg-transparent text-gray-900 border-2 border-gray-200 px-3 py-2 sm:px-4 sm:py-3 rounded-lg cursor-pointer transition-all duration-300 font-semibold text-xs sm:text-sm hover:bg-gray-100 hover:border-gray-300 hover:translate-y-[-1px] min-h-[44px]"
                          onClick={() => setSelectedProduct({...product, showDetail: true})}
                        >
                          View Details
                        </button>
                        <button
                          className="flex-1 bg-red-500 text-white border-2 border-red-500 px-3 py-2 sm:px-4 sm:py-3 rounded-lg cursor-pointer transition-all duration-300 font-semibold text-xs sm:text-sm hover:bg-green-500 hover:border-green-500 hover:translate-y-[-1px] hover:shadow-md min-h-[44px]"
                          onClick={() => addToCartWithToast(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Detail Modal */}
          {selectedProduct && selectedProduct.showDetail && (
            <ProductDetailModal 
              product={selectedProduct} 
              onClose={() => setSelectedProduct(null)}
              addToCart={addToCartWithToast}
            />
          )}

          {/* Cart Modal */}
          {showCart && (
            <Cart 
              cart={cart}
              setCart={setCart}
              setShowCart={setShowCart}
              setShowCheckout={setShowCheckout}
            />
          )}

          {/* Checkout Modal */}
          {showCheckout && (
            <Checkout 
              cart={cart}
              setCart={setCart}
              setShowCheckout={setShowCheckout}
              wilayas={wilayas}
              handleCheckout={handleCheckoutWithToast}
            />
          )}
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && !isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-full mx-2 sm:mx-4 w-full max-w-md relative shadow-2xl border border-gray-200 animate-slide-in">
            <button
              className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-gray-100 border-none text-xl sm:text-2xl cursor-pointer text-gray-500 transition-all duration-300 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:rotate-90 min-h-[32px] min-w-[32px]"
              onClick={() => {
                setShowAdminLogin(false)
                window.location.hash = 'store'
              }}
            >
              ×
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center relative">
              Admin Login
              <div className="absolute bottom-[-0.5rem] sm:bottom-[-0.75rem] left-1/2 transform -translate-x-1/2 w-12 sm:w-14 h-1 bg-red-500 rounded"></div>
            </h2>
            <form className="space-y-4 sm:space-y-6 pt-3 sm:pt-4" onSubmit={handleAdminLoginWithToast}>
              <input
                type="text"
                className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white font-inherit focus:outline-none focus:border-red-500 focus:shadow-lg focus:translate-y-[-1px]"
                placeholder="Username"
                value={adminLogin.username}
                onChange={(e) => setAdminLogin({...adminLogin, username: e.target.value})}
                required
              />
              <input
                type="password"
                className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all duration-300 bg-white font-inherit focus:outline-none focus:border-red-500 focus:shadow-lg focus:translate-y-[-1px]"
                placeholder="Password"
                value={adminLogin.password}
                onChange={(e) => setAdminLogin({...adminLogin, password: e.target.value})}
                required
              />
              <button type="submit" className="w-full bg-red-500 text-white border-none px-6 py-4 sm:px-8 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg cursor-pointer transition-all duration-300 shadow-lg hover:bg-green-500 hover:translate-y-[-2px] hover:shadow-xl uppercase tracking-wider min-h-[44px]">
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {page === "admin" && isAdmin && (
        <div className="admin-page bg-gray-50 min-h-screen">
          <div className="admin-layout flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
            {/* Sidebar */}
            <div className="admin-sidebar w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 py-4 sm:py-6 lg:py-8 shadow-sm">
              <div className="sidebar-header px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 border-b border-gray-200 mb-2 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">SHOP MCA Admin</h3>
              </div>
              <nav className="sidebar-nav flex flex-row lg:flex-col gap-1 sm:gap-2 px-2 sm:px-4 overflow-x-auto lg:overflow-x-visible">
                <button className="sidebar-btn px-4 py-3 sm:px-6 sm:py-4 bg-transparent border-none rounded-xl cursor-pointer transition-all duration-300 text-left font-medium text-gray-500 flex items-center gap-2 sm:gap-3 hover:bg-red-500 hover:text-white hover:translate-x-2 bg-red-500 text-white whitespace-nowrap text-xs sm:text-sm min-h-[44px]">Dashboard</button>
                <button className="sidebar-btn px-4 py-3 sm:px-6 sm:py-4 bg-transparent border-none rounded-xl cursor-pointer transition-all duration-300 text-left font-medium text-gray-500 flex items-center gap-2 sm:gap-3 hover:bg-red-500 hover:text-white hover:translate-x-2 whitespace-nowrap text-xs sm:text-sm min-h-[44px]">Products</button>
                <button className="sidebar-btn px-4 py-3 sm:px-6 sm:py-4 bg-transparent border-none rounded-xl cursor-pointer transition-all duration-300 text-left font-medium text-gray-500 flex items-center gap-2 sm:gap-3 hover:bg-red-500 hover:text-white hover:translate-x-2 whitespace-nowrap text-xs sm:text-sm min-h-[44px]">Orders</button>
                <button className="sidebar-btn px-4 py-3 sm:px-6 sm:py-4 bg-transparent border-none rounded-xl cursor-pointer transition-all duration-300 text-left font-medium text-gray-500 flex items-center gap-2 sm:gap-3 hover:bg-red-500 hover:text-white hover:translate-x-2 whitespace-nowrap text-xs sm:text-sm min-h-[44px]">Customers</button>
                <button className="sidebar-btn px-4 py-3 sm:px-6 sm:py-4 bg-transparent border-none rounded-xl cursor-pointer transition-all duration-300 text-left font-medium text-gray-500 flex items-center gap-2 sm:gap-3 hover:bg-red-500 hover:text-white hover:translate-x-2 whitespace-nowrap text-xs sm:text-sm min-h-[44px]">Analytics</button>
                <button className="sidebar-btn px-4 py-3 sm:px-6 sm:py-4 bg-transparent border-none rounded-xl cursor-pointer transition-all duration-300 text-left font-medium text-gray-500 flex items-center gap-2 sm:gap-3 hover:bg-red-500 hover:text-white hover:translate-x-2 whitespace-nowrap text-xs sm:text-sm min-h-[44px]">Settings</button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="admin-main flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <Dashboard 
                isAdmin={isAdmin}
                productName={productName} setProductName={setProductName}
                productDescription={productDescription} setProductDescription={setProductDescription}
                productPrice={productPrice} setProductPrice={setProductPrice}
                productCategory={productCategory} setProductCategory={setProductCategory}
                productPhotos={productPhotos} setProductPhotos={setProductPhotos}
                fetchProducts={fetchProducts}
                dashboardStats={dashboardStats}
                backendStatus={backendStatus}
                showSuccessMessage={showSuccessMessage}
                setShowSuccessMessage={setShowSuccessMessage}
                handleDeleteProduct={handleDeleteProductWithToast}
                products={products}
              />

              {/* Hero Content Management */}
              <div className="mt-6 sm:mt-8">
                <HeroContentManager backendStatus={backendStatus} />
              </div>

              {/* Orders Management */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200 mt-6 sm:mt-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Customer Orders ({orders.length})</h3>
                <div className="orders-list space-y-4 sm:space-y-6">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order._id} className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 border border-gray-200 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
                        <div className="order-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
                          <h4 className="text-lg sm:text-xl font-bold text-gray-900">{order.productName}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-base sm:text-lg font-bold text-red-500">DA{order.productPrice}</span>
                            <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                            {order.isVerified && <span className="bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">Verified</span>}
                          </div>
                        </div>
                        <div className="order-details grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <p className="text-gray-700 text-xs sm:text-sm"><strong>Client:</strong> {order.clientName}</p>
                          <p className="text-gray-700 text-xs sm:text-sm"><strong>Email:</strong> {order.email}</p>
                          <p className="text-gray-700 text-xs sm:text-sm"><strong>Phone:</strong> {order.phone}</p>
                          <p className="text-gray-700 text-xs sm:text-sm"><strong>Wilaya:</strong> {order.wilaya}</p>
                          <p className="text-gray-700 text-xs sm:text-sm"><strong>Address:</strong> {order.address}</p>
                          {order.color && <p className="text-gray-700 text-xs sm:text-sm"><strong>Color:</strong> {order.color}</p>}
                          {order.size && <p className="text-gray-700 text-xs sm:text-sm"><strong>Size:</strong> {order.size}</p>}
                          <p className="text-gray-700 text-xs sm:text-sm"><strong>Quantity:</strong> {order.quantity}</p>
                          <p className="text-gray-700 text-xs sm:text-sm"><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                        </div>
                        <div className="order-actions flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateOrderStatusWithToast(order._id, e.target.value)}
                            className="px-3 py-2 sm:px-4 sm:py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium cursor-pointer transition-all duration-300 focus:outline-none focus:border-red-500 text-xs sm:text-sm min-h-[44px] w-full sm:w-auto"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            className="bg-red-500 text-white border-none px-4 py-2 sm:px-6 sm:py-3 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-red-600 hover:translate-y-[-1px] hover:shadow-md text-xs sm:text-sm min-h-[44px] w-full sm:w-auto"
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            Delete Order
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No orders yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer 
        setPage={setPage}
        setShowContactModal={setShowContactModal}
        setShowHelpModal={setShowHelpModal}
        handleCall={handleCall}
        handleFindStore={handleFindStore}
      />
    </div>
  )
}

export default App