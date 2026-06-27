import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner
} from 'reactstrap';

const emptyProduct = {
  name: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  stock: '',
  imageUrl: '',
  tags: ''
};

const currency = value => Number(value || 0).toLocaleString(undefined, {
  style: 'currency',
  currency: 'USD'
});

const authConfig = token => ({
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { 'x-auth-token': token } : {})
  }
});

function ECommercePlatform({ auth }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    inStock: true,
    sort: 'featured'
  });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });
  const [activeView, setActiveView] = useState('shop');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isAdmin = auth.user && auth.user.role === 'admin';

  const cartItems = useMemo(() => cart.items || [], [cart]);
  const cartSubtotal = useMemo(() => cartItems.reduce((total, item) => {
    return total + (item.product ? item.product.price * item.quantity : 0);
  }, 0), [cartItems]);
  const cartCategories = useMemo(() => {
    return [...new Set(cartItems.map(item => item.product && item.product.category).filter(Boolean))];
  }, [cartItems]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        inStock: filters.inStock ? 'true' : 'false'
      };
      const res = await axios.get('/api/products', { params });
      setProducts(res.data);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Unable to load products.' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadCart = useCallback(async () => {
    if (!auth.isAuthenticated) {
      setCart({ items: [] });
      return;
    }

    const res = await axios.get('/api/cart', authConfig(auth.token));
    setCart(res.data);
  }, [auth.isAuthenticated, auth.token]);

  const loadOrders = useCallback(async () => {
    if (!auth.isAuthenticated) {
      setOrders([]);
      return;
    }

    const res = await axios.get('/api/orders', authConfig(auth.token));
    setOrders(res.data);
  }, [auth.isAuthenticated, auth.token]);

  const loadAdminOrders = useCallback(async () => {
    if (!isAdmin) {
      setAdminOrders([]);
      return;
    }

    const res = await axios.get('/api/orders/admin', authConfig(auth.token));
    setAdminOrders(res.data);
  }, [auth.token, isAdmin]);

  useEffect(() => {
    axios.get('/api/products/meta/categories')
      .then(res => setCategories(['All', ...res.data]))
      .catch(() => setCategories(['All']));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCart().catch(() => setMessage({ type: 'danger', text: 'Unable to load cart.' }));
    loadOrders().catch(() => setMessage({ type: 'danger', text: 'Unable to load orders.' }));
  }, [loadCart, loadOrders]);

  useEffect(() => {
    const params = cartCategories.length ? { categories: cartCategories.join(',') } : {};
    axios.get('/api/products/recommendations', { params })
      .then(res => setRecommendations(res.data))
      .catch(() => setRecommendations([]));
  }, [cartCategories]);

  useEffect(() => {
    loadAdminOrders().catch(() => setMessage({ type: 'danger', text: 'Unable to load admin orders.' }));
  }, [loadAdminOrders]);

  const onFilterChange = e => {
    const { name, value, type, checked } = e.target;
    setFilters(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onProductFormChange = e => {
    const { name, value } = e.target;
    setProductForm(current => ({ ...current, [name]: value }));
  };

  const addToCart = async product => {
    if (!auth.isAuthenticated) {
      setMessage({ type: 'warning', text: 'Log in to add products to your cart.' });
      return;
    }

    try {
      const res = await axios.post('/api/cart/items', {
        productId: product._id,
        quantity: 1
      }, authConfig(auth.token));
      setCart(res.data);
      setMessage({ type: 'success', text: `${product.name} added to cart.` });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Could not add that product.' });
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    const res = await axios.put(`/api/cart/items/${productId}`, { quantity }, authConfig(auth.token));
    setCart(res.data);
  };

  const checkout = async e => {
    e.preventDefault();

    if (!cartItems.length) {
      setMessage({ type: 'warning', text: 'Your cart is empty.' });
      return;
    }

    try {
      const res = await axios.post('/api/orders/checkout', { shippingAddress }, authConfig(auth.token));
      setCart({ items: [] });
      await loadProducts();
      await loadOrders();
      setMessage({ type: 'success', text: `Checkout complete. Payment reference ${res.data.paymentReference}.` });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Checkout failed. Please review your cart.' });
    }
  };

  const saveProduct = async e => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      tags: productForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      await axios.post('/api/products', payload, authConfig(auth.token));
      setProductForm(emptyProduct);
      await loadProducts();
      setMessage({ type: 'success', text: 'Inventory item created.' });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Could not save product.' });
    }
  };

  const seedProducts = async () => {
    try {
      const res = await axios.post('/api/products/seed', {}, authConfig(auth.token));
      await loadProducts();
      setMessage({ type: 'success', text: res.data.inserted ? 'Sample catalog added.' : res.data.msg });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Only admins can seed the catalog.' });
    }
  };

  const updateStock = async (product, stock) => {
    try {
      await axios.put(`/api/products/${product._id}`, { stock: Number(stock) }, authConfig(auth.token));
      await loadProducts();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Could not update stock.' });
    }
  };

  return (
    <main className="commerce-shell">
      <section className="store-toolbar">
        <div>
          <p className="eyebrow">MERN commerce</p>
          <h1>Shop products, manage inventory, and checkout in one flow.</h1>
        </div>
        <ButtonGroup>
          <Button color={activeView === 'shop' ? 'dark' : 'secondary'} onClick={() => setActiveView('shop')}>Shop</Button>
          <Button color={activeView === 'cart' ? 'dark' : 'secondary'} onClick={() => setActiveView('cart')}>Cart</Button>
          <Button color={activeView === 'orders' ? 'dark' : 'secondary'} onClick={() => setActiveView('orders')}>Orders</Button>
          {isAdmin ? <Button color={activeView === 'admin' ? 'dark' : 'secondary'} onClick={() => setActiveView('admin')}>Admin</Button> : null}
        </ButtonGroup>
      </section>

      {message ? <Alert color={message.type} toggle={() => setMessage(null)}>{message.text}</Alert> : null}

      {activeView === 'shop' ? (
        <>
          <section className="filter-panel">
            <Input name="search" value={filters.search} onChange={onFilterChange} placeholder="Search products" />
            <Input type="select" name="category" value={filters.category} onChange={onFilterChange}>
              {categories.map(category => <option key={category}>{category}</option>)}
            </Input>
            <Input name="minPrice" type="number" min="0" value={filters.minPrice} onChange={onFilterChange} placeholder="Min price" />
            <Input name="maxPrice" type="number" min="0" value={filters.maxPrice} onChange={onFilterChange} placeholder="Max price" />
            <Input type="select" name="sort" value={filters.sort} onChange={onFilterChange}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="priceAsc">Price low to high</option>
              <option value="priceDesc">Price high to low</option>
              <option value="rating">Top rated</option>
            </Input>
            <Label check className="stock-toggle">
              <Input type="checkbox" name="inStock" checked={filters.inStock} onChange={onFilterChange} /> In stock
            </Label>
          </section>

          {loading ? <Spinner /> : null}

          <section className="product-grid">
            {products.map(product => (
              <article className="product-card" key={product._id}>
                <img src={product.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'} alt={product.name} />
                <div className="product-card-body">
                  <div className="product-title-row">
                    <h2>{product.name}</h2>
                    <Badge color={product.stock ? 'success' : 'secondary'}>{product.stock} left</Badge>
                  </div>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <span>{product.category}</span>
                    <span>{product.brand}</span>
                    <span>{product.rating} stars</span>
                  </div>
                  <div className="buy-row">
                    <strong>{currency(product.price)}</strong>
                    <Button color="dark" disabled={!product.stock} onClick={() => addToCart(product)}>Add</Button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="recommendation-strip">
            <div>
              <p className="eyebrow">AI recommendations</p>
              <h2>Picked from cart context and product trends</h2>
            </div>
            <div className="recommendation-list">
              {recommendations.map(product => (
                <Button key={product._id} color="light" onClick={() => addToCart(product)}>
                  {product.name}
                  <small>{product.recommendationReason}</small>
                </Button>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {activeView === 'cart' ? (
        <Row className="commerce-grid">
          <Col lg="7">
            <section className="panel">
              <h2>Shopping cart</h2>
              {cartItems.length ? cartItems.map(item => (
                <div className="cart-line" key={item.product._id}>
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>{currency(item.product.price)} each</span>
                  </div>
                  <Input type="number" min="0" value={item.quantity} onChange={e => updateCartQuantity(item.product._id, e.target.value)} />
                </div>
              )) : <p className="muted">Your cart is empty.</p>}
              <div className="total-row">
                <span>Subtotal</span>
                <strong>{currency(cartSubtotal)}</strong>
              </div>
            </section>
          </Col>
          <Col lg="5">
            <section className="panel">
              <h2>Checkout</h2>
              <Form onSubmit={checkout}>
                {Object.keys(shippingAddress).map(field => (
                  <FormGroup key={field}>
                    <Label>{field.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input value={shippingAddress[field]} onChange={e => setShippingAddress(current => ({ ...current, [field]: e.target.value }))} />
                  </FormGroup>
                ))}
                <Button color="dark" block disabled={!auth.isAuthenticated}>Pay with mock Stripe</Button>
              </Form>
            </section>
          </Col>
        </Row>
      ) : null}

      {activeView === 'orders' ? (
        <section className="panel">
          <h2>Order history</h2>
          {orders.length ? orders.map(order => (
            <div className="order-line" key={order._id}>
              <div>
                <strong>{order.items.length} item order</strong>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <Badge color="info">{order.status}</Badge>
              <strong>{currency(order.subtotal)}</strong>
            </div>
          )) : <p className="muted">Orders appear here after checkout.</p>}
        </section>
      ) : null}

      {activeView === 'admin' && isAdmin ? (
        <Row className="commerce-grid">
          <Col lg="5">
            <section className="panel">
              <div className="admin-heading">
                <h2>Add inventory</h2>
                <Button color="secondary" onClick={seedProducts}>Seed catalog</Button>
              </div>
              <Form onSubmit={saveProduct}>
                {Object.keys(productForm).map(field => (
                  <FormGroup key={field}>
                    <Label>{field.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input
                      name={field}
                      type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                      value={productForm[field]}
                      onChange={onProductFormChange}
                      required={['name', 'category', 'price', 'stock'].includes(field)}
                    />
                  </FormGroup>
                ))}
                <Button color="dark" block>Save product</Button>
              </Form>
            </section>
          </Col>
          <Col lg="7">
            <section className="panel">
              <h2>Inventory</h2>
              {products.map(product => (
                <div className="inventory-line" key={product._id}>
                  <span>{product.name}</span>
                  <Input type="number" min="0" value={product.stock} onChange={e => updateStock(product, e.target.value)} />
                  <strong>{currency(product.price)}</strong>
                </div>
              ))}
            </section>
            <section className="panel">
              <h2>Recent orders</h2>
              {adminOrders.slice(0, 5).map(order => (
                <div className="order-line" key={order._id}>
                  <span>{order.user ? order.user.email : 'Customer'}</span>
                  <Badge color="info">{order.status}</Badge>
                  <strong>{currency(order.subtotal)}</strong>
                </div>
              ))}
            </section>
          </Col>
        </Row>
      ) : null}
    </main>
  );
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(ECommercePlatform);
