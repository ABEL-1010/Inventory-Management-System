import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Plus, Minus, Trash2, ShoppingCart, X } from "lucide-react";

const SalesForm = ({ sale, onClose, onSaleAdded }) => {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const isEditMode = Boolean(sale);

  // Fetch available items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Handle both response formats (array or paginated object)
        let itemsArray = [];
        if (Array.isArray(data)) {
          itemsArray = data; // Simple array format
        } else if (data.items && Array.isArray(data.items)) {
          itemsArray = data.items; // Paginated format
        } else if (data.data && Array.isArray(data.data)) {
          itemsArray = data.data; // Alternative format
        }
        
        console.log(' Loaded items:', itemsArray.length);
        setItems(itemsArray);

        if (isEditMode && sale) {
          console.log('🔄 Edit mode - pre-populating with sale:', sale);
          // Convert the single sale item to cart format
          const cartItem = {
            _id: sale.item?._id || sale.item,
            name: sale.item?.name || 'Unknown Item',
            price: sale.price || sale.item?.price || 0,
            quantity: sale.quantity || 1
          };
          setCart([cartItem]);
          
          // Pre-select the item and quantity
          setSelectedItem(cartItem._id);
          setQuantity(cartItem.quantity);
        }

      } catch (error) {
        console.error(error);
        toast.error("Failed to load items");
        setItems([]); // Ensure items is always an array
      }
    };
    fetchItems();
  }, [token, isEditMode, sale]);

  // Recalculate totals when cart changes
  useEffect(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newTax = newSubtotal * 0.1;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setGrandTotal(newSubtotal + newTax);
  }, [cart]);

  // Add selected item to cart
  const addToCart = () => {
    if (!selectedItem || quantity < 1) {
      toast.error("Please select an item and quantity");
      return;
    }

    
    if (!Array.isArray(items) || items.length === 0) {
      toast.error("No items available");
      return;
    }

    const item = items.find((i) => i._id === selectedItem);
    if (!item) {
      toast.error("Selected item not found");
      return;
    }

    if (isEditMode) {
      setCart([{ ...item, quantity }]);
    } else {
      // Original logic for create mode
      const existing = cart.find((c) => c._id === item._id);
      if (existing) {
        setCart(
          cart.map((c) =>
            c._id === item._id ? { ...c, quantity: c.quantity + quantity } : c
          )
        );
      } else {
        setCart([...cart, { ...item, quantity }]);
      }
    }

    setSelectedItem("");
    setQuantity(1);
    toast.success(isEditMode ? "Item updated" : "Item added to cart");
  };

  const removeFromCart = (id) => setCart(cart.filter((i) => i._id !== id));

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return removeFromCart(id);
    setCart(cart.map((i) => (i._id === id ? { ...i, quantity: newQty } : i)));
  };

  // Submit sales
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error("Cart is empty");
    setLoading(true);

    try {
      if (isEditMode) {
        // EDIT: Update existing sale
        console.log('🔄 Updating sale:', sale._id);
        await axios.put(
          `${import.meta.env.VITE_API_URL}/sales/${sale._id}`,
          { 
            item: cart[0]._id, 
            quantity: cart[0].quantity 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Sale updated successfully");
      } else {
        // CREATE: Process new sales
        for (const item of cart) {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/sales`,
            { item: item._id, quantity: item.quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        toast.success(`Successfully recorded ${cart.length} sale(s)`);
      }

      setCart([]);
      onSaleAdded?.();
      onClose();
    } catch (err) {
      console.error("Full error details:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to process sale";
      toast.error(`Sales Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Ensure items is an array before calling find
  const selectedItemData = Array.isArray(items) 
    ? items.find((i) => i._id === selectedItem) 
    : null;
  
  const lineTotal = selectedItemData ? selectedItemData.price * quantity : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6 text-amber-600">
          Point of Sale
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Select Item</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
                disabled={!Array.isArray(items) || items.length === 0}
              >
                <option value="">Choose an item...</option>
                {Array.isArray(items) && items.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                    disabled={item.quantity === 0}
                  >
                    {item.name} - ${item.price}{" "}
                    {item.quantity === 0 ? "(Out of Stock)" : ""}
                  </option>
                ))}
              </select>
              {(!Array.isArray(items) || items.length === 0) && (
                <p className="text-red-500 text-xs mt-1">No items available</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full border rounded-md p-2 text-sm"
                disabled={!selectedItem}
              />
            </div>

            {selectedItemData && (
              <div className="bg-amber-50 p-3 rounded-md text-sm flex justify-between">
                <span>Line Total:</span>
                <span className="font-semibold">${lineTotal.toFixed(2)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={addToCart}
              disabled={!selectedItem || !Array.isArray(items) || items.length === 0}
              className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add to Cart
            </button>
          </div>

          {/* Right Column */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Shopping Cart</h3>
              <ShoppingCart className="w-5 h-5 text-amber-500" />
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Cart is empty</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-white p-3 rounded-md border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        ${item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded ml-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Summary */}
            {cart.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-amber-600">${grandTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-4 font-semibold"
                >
                  {loading ? "Processing..." : `Complete Sale ($${grandTotal.toFixed(2)})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;