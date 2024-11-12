import React, { useState, useEffect } from 'react';
import './Css/Order.css';

const Order = () => {
    const [supplierId, setSupplierId] = useState('');
    const [productId, setProductId] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [amount, setAmount] = useState(0);
    const [proof, setProof] = useState(null);
    const [message, setMessage] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [productPrice, setProductPrice] = useState(0);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await fetch('http://localhost:8000/supplier/getAllSupplier', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    if (response.ok) {
                        setSuppliers(data);
                    } else {
                        console.error('Failed to fetch suppliers:', data.error);
                    }
                } else {
                    console.error("Unexpected content type:", contentType);
                    const text = await response.text();
                    console.error("Response body:", text);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };
        fetchSuppliers();
    }, []);
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8000/product/getAllProducts', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setProducts(data);
                } else {
                    console.error('Failed to fetch products:', data.error);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);
 
    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        setProductId(selectedProductId);
        const selectedProduct = products.find(product => product.id === selectedProductId);
        if (selectedProduct) {
            setProductPrice(selectedProduct.price);
            setAmount((selectedProduct.price * quantity).toFixed(2));
        } else {
            setProductPrice(0);
            setAmount(0);
        }
    };

    const handleQuantityChange = (e) => {
        const newQuantity = e.target.value;
        setQuantity(newQuantity);
        setAmount((productPrice * newQuantity).toFixed(2));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('supplierId', supplierId);
        formData.append('productId', productId);
        formData.append('description', description);
        formData.append('quantity', quantity);
        formData.append('amount', amount.toString());
        if (proof) {
            formData.append('proof', proof);
        }

        try {
            const response = await fetch('http://localhost:8000/order/createOrder', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const result = await response.json();
            if (response.ok) {
                setMessage('Order placed successfully!');
                setSupplierId('');
                setProductId('');
                setDescription('');
                setQuantity(1);
                setAmount(0);
                setProof(null);
                setProductPrice(0);
            } else {
                setMessage(`Error: ${result.error || 'Something went wrong.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Failed to place order. Please try again.');
        }
    };

    return (
        <div className="order-container">
            <div className="order-box">
                <h2>Order Raw Materials</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="supplierId">Supplier:</label>
                        <select 
                            id="supplierId" 
                            value={supplierId} 
                            onChange={(e) => setSupplierId(e.target.value)} 
                            required
                        >
                            <option value="">Select a supplier</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id || supplier.supplierId} value={supplier.id}>
                                    {supplier.name} || {supplier.supplierId}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="productId">Product :</label>
                        <select 
                            id="productId" 
                            value={productId} 
                            onChange={handleProductChange} 
                            required
                        >
                            <option value="">Select a Product</option>
                            {products.map((product) => (
                                <option key={product.id || product.productId} value={product.id}>
                                    {product.name} || Price: {product.price}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="description">Order Description:</label>
                        <textarea 
                            id="description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                            placeholder="Describe the order"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="quantity">Quantity:</label>
                        <input 
                            type="number" 
                            id="quantity" 
                            value={quantity} 
                            onChange={handleQuantityChange} 
                            required 
                            min="1" 
                            placeholder="Enter quantity"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="amount">Amount:</label>
                        <input 
                            type="number" 
                            id="amount" 
                            value={amount} 
                            readOnly 
                            placeholder="Total Amount"
                        />
                    </div>
                    <div className="input-group">
                        <button type="submit" className="order-button">Place Order</button>
                    </div>
                    {message && <div className="message">{message}</div>}
                </form>
            </div>
        </div>
    );
};

export default Order;
