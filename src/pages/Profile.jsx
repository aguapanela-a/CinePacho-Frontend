import { useState, useEffect, useCallback } from 'react';
import { User, Star, ShoppingBag, Clock, Shield, Ticket, Gift, CalendarCheck, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/useApp';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';
import { useToast } from '../context/useToast';
import ReviewModal from '../components/ReviewModal';
import { getUserReviews } from '../services/reviewService';
import { getMyPoints, redeemPoints } from '../services/pointsService';
import { getOrderHistory } from '../services/orderHistory';

// TODO: reemplazar por GET /api/orders/my cuando el back lo implemente
// import { getOrderHistory } from '../services/orderService'

export default function Profile() {
  const { user, basePoints, setBasePoints } = useApp();
  const buyerId = user.id;
  const { t } = useLanguage();
  const toast = useToast();

  const [reviewOrder, setReviewOrder] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('cinepacho_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [pointsHistory, setPointsHistory] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [currentTime] = useState(() => Date.now());



  // ── Cargar historial de órdenes ─────────────────────────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true)
      setOrdersError(null)
      try {
        // TODO: descomentar cuando el back implemente GET /api/orders/my
        console.log('Fetching order history for buyerId:', buyerId)
         const data = await getOrderHistory(buyerId)
         setOrderHistory(Array.isArray(data) ? data : [])
      } catch (err) {
        setOrdersError(err.message)
      } finally {
        setLoadingOrders(false)
      }
    }
    if (user?.userType?.toUpperCase()  === 'BUYER') fetchOrders()
  }, [user])

  // ── Cargar reviews del usuario ──────────────────────────────────────────────
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true)
      try {
        if (!buyerId) {
          setUserReviews([])
          return
        }
        const data = await getUserReviews(buyerId)
        setUserReviews(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
      } finally {
        setLoadingReviews(false)
      }
    }
    if (user?.userType?.toUpperCase() === 'BUYER') fetchReviews()
  }, [buyerId, user])

  // ── Puntos desde API ───────────────────────────────────────────────
  useEffect(() => {
    const fetchPoints = async () => {
      setLoadingPoints(true);
      try {
        const data = await getMyPoints();
        if (data) {
          setBasePoints(data.pointsNow || 0);
        }
      } catch (err) {
        console.error('Error fetching points', err);
      } finally {
        setLoadingPoints(false);
      }
    };
    if (user?.userType?.toUpperCase() === 'BUYER') fetchPoints();
  }, [user, setBasePoints]);

  const isReviewed = useCallback((orderId) => {
    const reviews = JSON.parse(localStorage.getItem('cinepacho_reviews') || '[]');
    return reviews.some((r) => r.orderId === orderId);
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const POINTS_FOR_REWARD = 100;
  const pointsProgress = Math.min((basePoints / POINTS_FOR_REWARD) * 100, 100);
  const canRedeem = basePoints >= POINTS_FOR_REWARD;

  const handleRedeemPoints = async () => {
    if (!canRedeem || redeeming) return;
    setRedeeming(true);
    try {
      const data = await redeemPoints();
      if (data && data.code) {
        toast.success(t('profile.couponGenerated') || '¡Boleta gratis generada! Válida por 6 meses.');
        
        // Actualizar puntos
        const newPointsData = await getMyPoints();
        setBasePoints(newPointsData.pointsNow || 0);
        setPointsHistory(newPointsData.historyPoints || []);
        
        const coupon = {
          id: data.code,
          expiresAt: data.expirationDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          used: false,
        };
        const updatedCoupons = [...coupons, coupon];
        setCoupons(updatedCoupons);
        localStorage.setItem('cinepacho_coupons', JSON.stringify(updatedCoupons));
      }
    } catch (err) {
      toast.error(err.message || 'Error al canjear puntos');
    } finally {
      setRedeeming(false);
    }
  };

  const validCoupons = coupons.filter((c) => !c.used && new Date(c.expiresAt) > new Date());

  // ── Render empleado / manager / admin ───────────────────────────────────────
  if (user.userType?.toUpperCase() !== 'BUYER') {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-[fadeUp_0.5s_ease-out_forwards] mt-10">
        <div className="bg-surface/80 border border-border/50 rounded-3xl p-10 backdrop-blur-xl flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-magenta to-vinotinto rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(200,22,122,0.4)] mb-6">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-display text-white mb-2">{user.name}</h1>
          <p className="text-magenta font-bold tracking-widest uppercase text-sm mb-8">
            {t('nav.profile')} - {t(`roles.${user.userType}`)}
          </p>
          <div className="bg-carbon border border-border/50 rounded-2xl p-6 w-full max-w-md">
            <p className="text-text-secondary text-sm">{t('profile.specialPrivileges')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render cliente (BUYER) ───────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 animate-[fadeUp_0.5s_ease-out_forwards]">
      <h1 className="text-4xl font-display uppercase tracking-widest text-white mb-8">
        <span className="gradient-brand">{t('profile.title')}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Columna izquierda ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Info del usuario */}
          <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl text-center">
            <div className="w-24 h-24 bg-carbon border-2 border-magenta rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-magenta" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-text-secondary text-sm mb-6">{t('profile.client')}</p>
          </div>

          {/* Puntos */}
          <div className="bg-gradient-to-br from-gold/20 to-yellow-600/10 border border-gold/30 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Star size={100} />
            </div>
            <div className="relative z-10">
              <h3 className="text-gold font-bold uppercase tracking-widest text-sm mb-2">{t('profile.accumulatedPoints')}</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-display text-white">{basePoints}</span>
                <span className="text-text-secondary mb-1">{t('common.points')}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">{t('profile.rewardProgress')}</span>
                  <span className="text-gold">{basePoints} / {POINTS_FOR_REWARD}</span>
                </div>
                <div className="h-2 w-full bg-carbon rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-yellow-500 transition-all duration-1000 ease-out"
                    style={{ width: `${pointsProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-secondary mt-2">
                  {canRedeem
                    ? (t('profile.readyToRedeem') || '¡Puedes canjear tu boleta gratis!')
                    : t('profile.missingPoints', { points: Math.max(0, POINTS_FOR_REWARD - basePoints) })
                  }
                </p>
              </div>
              {canRedeem && (
                <button
                  onClick={handleRedeemPoints}
                  disabled={redeeming}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-gold to-yellow-600 text-carbon font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-gold/30 animate-[fadeUp_0.3s_ease-out] disabled:opacity-50"
                >
                  {redeeming ? <Loader2 size={18} className="animate-spin" /> : <Gift size={18} />}
                  {t('profile.redeemFreeTicket') || 'Canjear Boleta Gratis'}
                </button>
              )}
            </div>
          </div>

          {/* Cupones activos */}
          {validCoupons.length > 0 && (
            <div className="bg-surface/80 border border-green-500/30 rounded-3xl p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <Ticket size={18} />
                <h3 className="font-bold text-sm tracking-wider uppercase">
                  {t('profile.activeCoupons') || 'Boletas Gratis Activas'}
                </h3>
              </div>
              {validCoupons.map((coupon) => (
                <div key={coupon.id} className="bg-carbon border border-border/50 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{coupon.id}</p>
                    <p className="text-text-secondary text-xs flex items-center gap-1 mt-1">
                      <CalendarCheck size={12} />
                      {t('profile.expiresAt') || 'Válido hasta'}: {new Date(coupon.expiresAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <span className="text-green-400 text-xs font-bold bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                    {t('common.active') || 'Activo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Columna derecha ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Historial de órdenes */}
          <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
              <ShoppingBag className="text-magenta" size={24} />
              <h2 className="text-2xl font-display text-white tracking-widest uppercase">
                {t('profile.purchaseHistory')}
              </h2>
            </div>

            {/* Estados de carga */}
            {loadingOrders && (
              <div className="flex items-center justify-center py-12 gap-3 text-text-secondary">
                <Loader2 size={20} className="animate-spin text-magenta" />
                <span className="text-sm">Cargando historial...</span>
              </div>
            )}

            {!loadingOrders && ordersError && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} /> {ordersError}
              </div>
            )}

            {!loadingOrders && !ordersError && orderHistory.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                <ShoppingBag size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No tienes compras registradas aún.</p>
              </div>
            )}

            {!loadingOrders && orderHistory.length > 0 && (
              <div className="space-y-4">
                {orderHistory.map((order, index) => {
                  // ID compuesto porque el backend no devuelve un id de orden
                  const orderId = `${order.movieTitle}_${order.screeningDate}_${order.movieId}`;

                  // Formatear "2026-06-03T18:00" → "3 jun. 2026, 6:00 p.m."
                  const screeningFormatted = order.screeningDate
                    ? new Date(order.screeningDate).toLocaleString('es-CO', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '—'

                  // Colores dinámicos según el status
                  const statusStyle = {
                    COMPLETED: 'text-green-400 bg-green-500/10 border-green-500/20',
                    PENDING:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                    CANCELLED: 'text-red-400   bg-red-500/10   border-red-500/20',
                  }[order.status] ?? 'text-text-secondary bg-carbon border-border/30'

                  return (
                    <div
                      key={orderId || index}
                      className="bg-carbon border border-border/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-magenta/30 transition-colors"
                    >
                      {/* ── Lado izquierdo ──────────────────────── */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-magenta/10 rounded-xl flex items-center justify-center shrink-0">
                          <Ticket className="text-magenta" size={20} />
                        </div>
                        <div>
                          <p className="text-white font-bold mb-1">{order.movieTitle}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {screeningFormatted}
                            </span>
                            {order.roomNumber && (
                              <>
                                <span>•</span>
                                <span>Sala {order.roomNumber.trim()}</span>
                              </>
                            )}
                          </div>
                          <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-lg border ${statusStyle}`}>
                            {order.message || order.status}
                          </span>
                        </div>
                      </div>

                      {/* ── Lado derecho ────────────────────────── */}
                      <div className="flex items-center gap-3 border-t border-border/50 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                        <div className="text-right">
                          <span className="text-white font-bold text-lg block">
                            ${order.totalPurchase?.toLocaleString('es-CO') ?? '0'}
                          </span>
                          {/* Desglose sólo si hay snacks */}
                          {order.totalSnacks > 0 ? (
                            <span className="text-xs text-text-secondary block">
                              Entradas ${order.totalSeats?.toLocaleString('es-CO')}
                              {' · '}
                              Snacks ${order.totalSnacks?.toLocaleString('es-CO')}
                            </span>
                          ) : (
                            <span className="text-xs text-text-secondary block">
                              Solo entradas
                            </span>
                          )}
                        </div>

                        {isReviewed(orderId) ? (
                          <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
                            ✓ {t('review.reviewed') || 'Evaluado'}
                          </span>
                        ) : (
                          <button
                            onClick={() => setReviewOrder({ ...order, id: orderId })}
                            disabled={!buyerId}
                            className={`text-xs font-bold ${
                              buyerId
                                ? 'text-gold bg-gold/10 border border-gold/30 hover:bg-gold/20'
                                : 'text-text-secondary bg-carbon border border-border/30 cursor-not-allowed'
                            } px-3 py-2 rounded-xl transition-colors`}
                          >
                            <Star size={12} className="inline mr-1" />
                            {buyerId
                              ? (t('Evaluar') || 'Evaluar')
                              : (t('No disponible') || 'No disponible')}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                <button className="w-full mt-2 py-4 rounded-xl border border-border/50 text-text-secondary font-bold hover:text-white hover:bg-carbon transition-colors">
                  {t('profile.seeAllPurchases')}
                </button>
              </div>
            )}
          </div>

          {/* Historial de valoraciones */}
          <div className="bg-surface/80 border border-border/50 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <Star className="text-gold" size={24} />
              <h2 className="text-2xl font-display text-white tracking-widest uppercase">
                {t('Mis Valoraciones') || 'Mis Valoraciones'}
              </h2>
            </div>

            {loadingReviews && (
              <div className="flex items-center justify-center py-8 gap-3 text-text-secondary">
                <Loader2 size={20} className="animate-spin text-gold" />
                <span className="text-sm">Cargando valoraciones...</span>
              </div>
            )}

            {!buyerId && !loadingReviews && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-yellow-100 text-sm">
                {t('review.missingBuyerIdWarning') || 'No se puede cargar ni enviar valoraciones porque el backend no proporcionó un ID de comprador en la sesión.'}
              </div>
            )}

            {!loadingReviews && buyerId && userReviews.length === 0 && (
              <p className="text-text-secondary text-sm text-center py-4">
                No has realizado ninguna valoración aún.
              </p>
            )}

            {!loadingReviews && userReviews.length > 0 && (
              <div className="space-y-4">
                {userReviews.map((review, idx) => (
                  <div key={idx} className="bg-carbon border border-border/40 rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-magenta">
                        {review.reviewType === 'MOVIE' ? 'Película' : 'Servicio'}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {new Date(review.reviewDate).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gold mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                          className={i < review.rating ? 'text-gold' : 'text-border'}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-white/90 italic">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewModal order={reviewOrder} buyerId={buyerId} onClose={() => setReviewOrder(null)} />
    </div>
  );
}