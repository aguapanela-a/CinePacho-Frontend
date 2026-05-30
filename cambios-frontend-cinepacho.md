# Cambios Frontend — Cine Pacho
> Resumen de todos los cambios y conexiones pendientes al backend.

---

## 1. `paymentService.js` — Agregar `confirmPayment`

Después de que Stripe aprueba el cobro, hay que avisarle al back para que genere el QR y lo envíe al correo del cliente.

```js
export const confirmPayment = (paymentIntentId, customerEmail, seats = [], snacks = [], shippingInfo = {}) =>
  apiFetch('/api/payments/confirm', {
    method: 'POST',
    body: JSON.stringify({ paymentIntentId, customerEmail, seats, snacks, shippingInfo }),
  })
```

---

## 2. `Checkout.jsx` — Extraer `paymentIntentId` y usar el nuevo `CheckoutForm`

**Agregar estado:**
```js
const [paymentIntentId, setPaymentIntentId] = useState(null)
```

**Al recibir el clientSecret del back:**
```js
const piId = result.clientSecret.split('_secret_')[0] // "pi_xxx"
setPaymentIntentId(piId)
setClientSecret(result.clientSecret)
```

**Reemplazar el `<CheckoutForm>` por:**
```jsx
<CheckoutForm
  total={cartTotal}
  paymentIntentId={paymentIntentId}
  seats={paymentData.seats}
  snacks={paymentData.snacks}
  shippingInfo={shippingInfo}
/>
```

---

## 3. `CheckoutForm.jsx` — Nuevo archivo

Separar el formulario de Stripe en su propio componente. El flujo es:

1. `stripe.confirmPayment()` → Stripe cobra
2. `confirmPayment()` → Back valida, genera QR y envía correo
3. `saveOrderSnapshot()` → Guarda resumen para `/confirmacion`
4. `navigate('/confirmacion')`

> Ver archivo `CheckoutForm.jsx` entregado.

---

## 4. `ReviewModal.jsx` — Conectar al backend

**Agregar import:**
```js
import { submitReview } from '../services/reviewService'
```

**En `handleSubmit`, después de guardar en localStorage:**
```js
try {
  await submitReview({ orderId: order.id, movieRating, serviceRating, comment })
} catch (err) {
  console.error('No se pudo enviar la reseña al backend:', err.message)
  // No bloquea: ya quedó en localStorage como respaldo
}
```

---

## 5. `reviewService.js` — Nuevo archivo

```js
export const submitReview = (data) =>
  apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({
      orderId:       data.orderId,
      movieRating:   data.movieRating   || null,
      serviceRating: data.serviceRating || null,
      comment:       data.comment?.trim() || null,
      reviewedAt:    new Date().toISOString(),
    }),
  })

export const checkReviewed = (orderId) =>
  apiFetch(`/api/reviews/order/${encodeURIComponent(orderId)}`)
```

---

## 6. `CashierDashboard.jsx` — Conectar búsqueda de cliente y checkout

**Agregar imports:**
```js
import { findCustomer, processCashierOrder } from '../services/cashierService'
```

**Reemplazar `handleSearchCustomer`:**
```js
const handleSearchCustomer = async () => {
  try {
    const found = await findCustomer(searchCustomer)
    setActiveCustomer(found)
    setSearchCustomer('')
  } catch {
    toast.error(t('cashier.customerNotFound'))
  }
}
```

**Reemplazar `handleCheckout`:**
```js
const handleCheckout = async () => {
  if (cart.length === 0) return
  try {
    await processCashierOrder({
      customerId:    activeCustomer?.id ?? null,
      wantsPoints,
      cart,
      total,
      paymentMethod: 'CASH',
    })
    setShowSuccess(true)
  } catch (err) {
    toast.error('Error procesando la venta: ' + err.message)
  }
}
```

---

## 7. `cashierService.js` — Nuevo archivo

```js
export const findCustomer = (query) =>
  apiFetch(`/api/cashier/customer/${encodeURIComponent(query)}`)

export const processCashierOrder = (data) =>
  apiFetch('/api/cashier/order', {
    method: 'POST',
    body: JSON.stringify({
      customerId:    data.customerId    ?? null,
      wantsPoints:   data.wantsPoints   ?? false,
      paymentMethod: data.paymentMethod ?? 'CASH',
      total:         data.total,
      items: data.cart.map((item) => ({
        id:        item.id,
        name:      item.name,
        type:      item.type,
        qty:       item.qty,
        unitPrice: item.unitPrice,
        showtime:  item.showtime ?? null,
      })),
    }),
  })
```

---

## 8. `Home.jsx` — Reemplazar mock por API real

**Reemplazar import y useEffect:**
```js
// Quitar:
import { moviesData } from '../data/mockMoviesData'

// Agregar:
import { searchMovies } from '../services/movieService'
const [movies, setMovies] = useState([])

useEffect(() => {
  const fetchMovies = async () => {
    setIsLoading(true)
    try {
      const data = await searchMovies('')
      setMovies(Array.isArray(data) ? data : [])
    } catch {
      setMovies(moviesData) // fallback al mock
    } finally {
      setIsLoading(false)
    }
  }
  fetchMovies()
}, [])
```

**Cambiar `filteredMovies` para filtrar sobre `movies` en lugar de `moviesData`.**

---

## 9. `SeatSelector.jsx` — Reemplazar sillas ocupadas mock

**Crear `seatService.js`:**
```js
export const getOccupiedSeats = (screeningId) =>
  apiFetch(`/api/seats/${screeningId}/occupied`)
```

**En `SeatSelector.jsx`, reemplazar el `useState` aleatorio:**
```js
const [occupiedSeats, setOccupiedSeats] = useState(new Set())

useEffect(() => {
  getOccupiedSeats(screeningId).then(data => {
    setOccupiedSeats(new Set(data.map(s => s.seatId)))
  })
}, [screeningId])
```

---

## 10. Precios de boletas — Vienen del admin, no del mock

`ticketFormats` en `mockMoviesData.js` debe desaparecer. Los precios los define el admin al crear un screening con `createScreening()`. Cuando el back devuelva el screening con su precio, `ShowtimePicker.jsx` y `SeatSelector.jsx` solo los leen y los muestran — sin lógica extra.

---

## Pendientes que dependen del back

| Qué | Endpoint esperado |
|-----|-------------------|
| Películas en cartelera | `GET /api/admin/search?query=` |
| Sillas ocupadas | `GET /api/seats/:screeningId/occupied` |
| Historial de órdenes (Profile) | `GET /api/orders/my` |
| Confirmar pago y generar QR | `POST /api/payments/confirm` |
| Procesar venta en caja | `POST /api/cashier/order` |
| Buscar cliente en caja | `GET /api/cashier/customer/:query` |
| Enviar reseña | `POST /api/reviews` |

---

## Variable de entorno requerida

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

Sin esta variable el checkout queda en modo demo visual.
