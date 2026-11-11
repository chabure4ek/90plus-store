import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './App.css';

const products = [
  { id: 1, name: 'Manchester United Home Jersey', price: 35000, image: '/images/united.jpg' },
  { id: 2, name: 'Real Madrid Home Jersey', price: 38000, image: '/images/madrid.jpg' },
  { id: 3, name: 'Nike Mercurial Football Boots', price: 65000, image: '/images/mercurial.jpg' },
  { id: 4, name: 'Adidas Champions League Ball', price: 25000, image: '/images/ball.jpg' },
];

const formatPrice = (amount) => `${amount.toLocaleString('ru-RU')} ₸`;

function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('footballStoreCart')) || []; }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [sending, setSending] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => { localStorage.setItem('footballStoreCart', JSON.stringify(cart)); }, [cart]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleAddToCart(product) {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);
      return existing
        ? previous.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...previous, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, amount) {
    setCart((previous) => previous
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  function removeFromCart(productId) {
    setCart((previous) => previous.filter((item) => item.id !== productId));
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (sending || !cart.length) return;
    setCheckoutError('');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      setCheckoutError('Отправка писем ещё не настроена. Укажите параметры EmailJS в файле .env.local.');
      return;
    }

    const orderItems = cart.map((item) =>
      `${item.name} — ${item.quantity} шт. × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    setSending(true);
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: 'asylbekovnurym2007@gmail.com',
            customer_name: customer.name.trim(),
            customer_phone: customer.phone.trim(),
            customer_address: customer.address.trim(),
            order_items: orderItems,
            order_total: formatPrice(cartTotal),
          },
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCustomer({ name: '', phone: '', address: '' });
      setSuccessMessage('Заказ отправлен! Спасибо за покупку в 90+ STORE.');
    } catch (error) {
      console.error('EmailJS:', error);
      setCheckoutError('Не удалось отправить заказ. Проверьте настройки EmailJS и попробуйте ещё раз.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <a className="logo" href="#home"><span>90+</span> STORE</a>
        <nav className="navigation">
          <a href="#home">Главная</a>
          <a href="#catalog">Каталог</a>
          <a href="#about">О нас</a>
          <a href="#contacts">Контакты</a>
        </nav>
        <button className="cart-button" onClick={() => setIsCartOpen(true)}>🛒 Корзина ({cartCount})</button>
      </header>

      <main id="home" className="hero">
        <div className="hero-content">
          <p className="hero-label">FOOTBALL COLLECTION 2026</p>
          <h1>YOUR GAME.<span> YOUR STYLE.</span></h1>
          <p className="hero-description">Футбольная экипировка для тех, кто живёт игрой.</p>
          <a href="#catalog" className="hero-button">Смотреть каталог →</a>
        </div>
        <div className="hero-image"><img src="/images/hero.jpg" alt="Футболист" /></div>
      </main>

      <section id="catalog" className="catalog">
        <h2>НАШ КАТАЛОГ</h2>
        <div className="catalog-search">
          <input type="search" placeholder="Поиск товаров..." aria-label="Поиск товаров"
            value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="products-grid">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />)}
        </div>
        {filteredProducts.length === 0 && <p className="empty-results">По вашему запросу товары не найдены.</p>}
      </section>

      <section id="about" className="info-section">
        <p className="section-eyebrow">90+ STORE</p>
        <h2>О НАС</h2>
        <p>90+ STORE — учебный проект интернет-магазина для любителей футбола. Здесь собраны футбольные футболки, бутсы и аксессуары. Мы создали удобный каталог, поиск и корзину, чтобы выбирать экипировку было просто.</p>
      </section>

      <section id="contacts" className="info-section contacts-section">
        <p className="section-eyebrow">НА СВЯЗИ</p>
        <h2>КОНТАКТЫ</h2>
        <p>Есть вопросы по товарам или заказу? Напишите нам:</p>
        <a href="mailto:asylbekovnurym2007@gmail.com">asylbekovnurym2007@gmail.com</a>
      </section>
      <footer className="footer">© 2026 90+ STORE · YOUR GAME. YOUR STYLE.</footer>

      {successMessage && (
        <div className="notice" role="status">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} aria-label="Закрыть уведомление">✕</button>
        </div>
      )}

      {isCartOpen && (
        <div className="cart-overlay" onClick={() => { if (!sending) { setIsCartOpen(false); setIsCheckoutOpen(false); } }}>
          <aside className="cart-panel" onClick={(event) => event.stopPropagation()} aria-label="Корзина">
            <div className="cart-header">
              <h2>{isCheckoutOpen ? 'ОФОРМЛЕНИЕ ЗАКАЗА' : 'ВАША КОРЗИНА'}</h2>
              <button onClick={() => { if (!sending) { setIsCartOpen(false); setIsCheckoutOpen(false); } }} aria-label="Закрыть">✕</button>
            </div>

            {isCheckoutOpen ? (
              <form className="checkout-form" onSubmit={submitOrder}>
                <label>Ваше имя
                  <input required maxLength={100} autoComplete="name" value={customer.name}
                    onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Имя и фамилия" />
                </label>
                <label>Телефон
                  <input required type="tel" maxLength={40} autoComplete="tel" value={customer.phone}
                    onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="+7 ..." />
                </label>
                <label>Адрес доставки
                  <textarea required maxLength={300} rows={3} autoComplete="street-address" value={customer.address}
                    onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Город, улица, дом, квартира" />
                </label>
                <div className="cart-total"><span>Итого:</span><strong>{formatPrice(cartTotal)}</strong></div>
                {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
                <button className="checkout-button" type="submit" disabled={sending || cart.length === 0}>
                  {sending ? 'Отправляем заказ...' : 'Подтвердить заказ'}
                </button>
                <button type="button" className="back-button" disabled={sending} onClick={() => { setCheckoutError(''); setIsCheckoutOpen(false); }}>← Вернуться в корзину</button>
              </form>
            ) : (
              <>
                {cart.length === 0 ? <p className="empty-cart">Корзина пока пуста</p> : (
                  <div className="cart-items">
                    {cart.map((product) => (
                      <div className="cart-item" key={product.id}>
                        <img src={product.image} alt={product.name} />
                        <div className="cart-item-info">
                          <h3>{product.name}</h3><p>{formatPrice(product.price)}</p>
                          <div className="quantity-controls">
                            <button onClick={() => changeQuantity(product.id, -1)} aria-label="Уменьшить количество">−</button>
                            <span>{product.quantity}</span>
                            <button onClick={() => changeQuantity(product.id, 1)} aria-label="Увеличить количество">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(product.id)} aria-label="Удалить товар">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="cart-footer">
                  <div className="cart-total"><span>Итого:</span><strong>{formatPrice(cartTotal)}</strong></div>
                  <button className="checkout-button" disabled={cart.length === 0}
                    onClick={() => { setCheckoutError(''); setIsCheckoutOpen(true); }}>Оформить заказ</button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
