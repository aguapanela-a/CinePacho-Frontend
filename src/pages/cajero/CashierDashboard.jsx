import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Popcorn,
  Ticket,
  UserCheck,
  X,
  LogOut,
  CheckCircle,
  Film,
  Clock,
  QrCode,
} from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useApp } from "../../context/useApp";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { getUnitPrice } from "../../utils/formatCurrency";
import { getMovieSelectorsByMultiplex } from "../../services/movieService";
import { getAllSnacks } from "../../services/snackService";
import { createCheckoutSession } from "../../services/paymentService";
import { scanTicket } from "../../services/employeeService";
import { validateVoucher } from "../../services/pointsService";
import { saveOrderSnapshot } from "../../utils/orderSnapshot";
// FIX 1: SeatSelector was used but never imported
import SeatSelector from "../../components/SeatSelector";
// FIX 2: TMDB image base URL was missing — posterPath is just a path like "/abc.jpg"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function CashierDashboard() {
  const { user, logoutUser, cart, addToCart, removeFromCart, setCart } =
    useApp();
  const toast = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tickets"); // 'tickets' | 'snacks'
  const [movies, setMovies] = useState([]);
  const [snacks, setSnacks] = useState([]);

  // QR Scanner
  const [isScanning, setIsScanning] = useState(false);
  const [isScanProcessing, setIsScanProcessing] = useState(false);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      const multiplexId = user?.multiplexId;
      console.log("loadData ejecutado, multiplexId:", multiplexId);
      if (!multiplexId) {
        setMovies([]);
        setSnacks([]);
        return;
      }

      try {
        const moviesResp = await getMovieSelectorsByMultiplex(multiplexId);
        console.log("moviesResp:", moviesResp);
        if (Array.isArray(moviesResp)) {
          const mapped = moviesResp.map((item) => ({
            id: item.movieInfo?.id,
            title: item.movieInfo?.title,
            posterUrl: item.movieInfo?.poster_path
              ? `${TMDB_IMAGE_BASE}${item.movieInfo.poster_path}`
              : "https://via.placeholder.com/200x300?text=Sin+imagen",
            screenings: item.screenings || [],
          }));
          console.log("mappeados:", mapped);
          console.log("moviesResp:", moviesResp);
          console.log("Es array:", Array.isArray(moviesResp));
          setMovies(mapped);
        } else {
          setMovies([]);
        }
      } catch {
        setMovies([]);
      }

      try {
        const snacksResp = await getAllSnacks(multiplexId);
        if (Array.isArray(snacksResp) && snacksResp.length > 0) {
          setSnacks(
            snacksResp.map((s) => ({
              id: s.idSnack,
              name: s.nameSnack,
              price: Number(s.priceSnack) || 0,
              multiplexId,
              imageUrl: s.imageUrl || null,
            })),
          );
        } else {
          setSnacks([]);
        }
      } catch {
        setSnacks([]);
      }
    };
    loadData();
  }, [user?.multiplexId]);

  // Customer
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [manualEmail, setManualEmail] = useState("");
  const [cashOnlyMode, setCashOnlyMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wantsPoints, setWantsPoints] = useState(false);

  // Voucher / Cupón
  const [voucherCode, setVoucherCode] = useState("");
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Ticket Selection Modal
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeatIdsByScreening, setSelectedSeatIdsByScreening] = useState(
    {},
  );
  const [isSeatSelectorOpen, setIsSeatSelectorOpen] = useState(false);

  // FIX 3: Only show ACTIVE screenings
  const movieScreenings =
    selectedMovie?.screenings?.filter(
      (s) => s.status?.toUpperCase() === "ACTIVE",
    ) || [];

  // Agrupar horarios únicos
  const availableShowtimes =
    movieScreenings.length > 0
      ? [
          ...new Set(
            movieScreenings
              .map((s) => s.screeningDate?.substring(11, 16))
              .filter(Boolean),
          ),
        ].sort()
      : [];

  const [selectedTime, setSelectedTime] = useState(null);

  // FIX 4: Extract price and formats correctly from screening data
  // The backend returns screenings with screeningId, roomId, roomNumber, screeningDate, status, format
  // Price comes from the multiplex general/preferential price — we pass it through as generalPrice
  const availableRooms =
    movieScreenings.length > 0 && selectedTime
      ? movieScreenings
          .filter((s) => s.screeningDate?.substring(11, 16) === selectedTime)
          .map((s) => ({
            id: s.roomId,
            name: s.roomNumber ?? `Sala ${s.roomId?.toString().slice(-4)}`,
            screeningId: s.screeningId,
            // FIX 4: Build a formats array from the format string on the screening
            // If the backend sends a single format string (e.g. "2D", "3D"), wrap it
            formats: s.format
              ? [{ fmt: s.format, generalPrice: s.price ?? 0 }]
              : [],
            // Keep raw price as fallback for the "General" button
            price: s.price ?? 0,
          }))
      : [];

  const [selectedRoomObj, setSelectedRoomObj] = useState(null);

  const ticketItems = cart.filter((item) => item.type === "ticket");
  const ticketScreeningIds = [
    ...new Set(ticketItems.map((item) => item.screeningId).filter(Boolean)),
  ];
  const ticketScreeningId = ticketScreeningIds[0] || null;
  const ticketRoomId = ticketItems[0]?.roomId || null;
  const ticketFormat = ticketItems[0]?.format || "2D";
  const ticketCount = ticketItems.reduce(
    (total, item) => total + (item.qty || 0),
    0,
  );
  const ticketSeatIdsFromCart = [
    ...new Set(
      ticketItems.flatMap((item) =>
        Array.isArray(item.seatIds) ? item.seatIds : [],
      ),
    ),
  ];
  const selectedSeatIds = ticketScreeningId
    ? selectedSeatIdsByScreening[ticketScreeningId] || ticketSeatIdsFromCart
    : ticketSeatIdsFromCart;
  const needsSeatSelection =
    ticketCount > 0 && selectedSeatIds.length !== ticketCount;

  useEffect(() => {
    if (cart.length === 0) {
      setSelectedSeatIdsByScreening({});
    }
  }, [cart]);

  const POINTS_PER_PURCHASE = 10;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedTime(null);
    setSelectedRoomObj(null);
  };

  const handleAddTicket = (time, format, price) => {
    if (!selectedRoomObj) {
      toast.error("Por favor selecciona una sala");
      return;
    }
    if (!selectedRoomObj.screeningId) {
      toast.error("No se encontró la función seleccionada");
      return;
    }

    const item = {
      id: `${selectedMovie.id}-${time}-${format}-${selectedRoomObj.name}`,
      name: `Boleta ${format} - ${selectedMovie.title} (${time}) - ${selectedRoomObj.name}`,
      price: Number(price) || 0,
      type: "ticket",
      showtime: `${time} - ${selectedRoomObj.name}`,
      qty: 1,
      image: selectedMovie.posterUrl,
      screeningId: selectedRoomObj.screeningId,
      roomId: selectedRoomObj.id,
      roomName: selectedRoomObj.name,
      format,
      multiplexId: user?.multiplexId || null,
    };
    addToCart(item);
    setSelectedMovie(null);
    setSelectedTime(null);
    setSelectedRoomObj(null);
  };

  const handleAddSnackToCart = (snack) => {
    const item = {
      id: snack.id,
      name: snack.name,
      price: Number(snack.price) || 0,
      type: "snack",
      qty: 1,
      image: snack.imageUrl || null,
      multiplexId: snack.multiplexId || user?.multiplexId || null,
    };
    addToCart(item);
  };

  const openSeatSelector = () => {
    if (!ticketScreeningId || !ticketRoomId) {
      toast.error(
        "No hay información de la función disponible para seleccionar asientos.",
      );
      return;
    }
    setIsSeatSelectorOpen(true);
  };

  const handleConfirmSeatSelection = (seats, seatsTotal) => {
    if (!ticketScreeningId) return;
    
    setSelectedSeatIdsByScreening((prev) => ({
      ...prev,
      [ticketScreeningId]: seats,
    }));

    const totalTicketsQty = cart
      .filter(
        (item) =>
          item.type === "ticket" && item.screeningId === ticketScreeningId,
      )
      .reduce((acc, item) => acc + item.qty, 0);

    if (totalTicketsQty > 0 && seatsTotal > 0) {
      const updatedPricePerTicket = seatsTotal / totalTicketsQty;
      const updatedCart = cart.map((item) => {
        if (item.type === "ticket" && item.screeningId === ticketScreeningId) {
          return {
            ...item,
            unitPrice: updatedPricePerTicket,
            price: updatedPricePerTicket.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }),
          };
        }
        return item;
      });
      setCart(updatedCart);
    }
    
    setIsSeatSelectorOpen(false);
  };

  const handleRemoveFromCart = (itemToRemove) => {
    removeFromCart(itemToRemove.id, itemToRemove.type, itemToRemove.showtime);
  };

  // Calcular total sin descuento
  const subtotal = cart.reduce(
    (acc, item) => acc + getUnitPrice(item) * item.qty,
    0,
  );

  // FIX 5: Descuento — voucher ahora también aplica con manualEmail (no solo activeCustomer)
  let discount = 0;
  if (appliedVoucher) {
    let cheapestTicketPrice = Infinity;
    cart.forEach((item) => {
      if (item.type === "ticket") {
        const p = getUnitPrice(item);
        if (p < cheapestTicketPrice) cheapestTicketPrice = p;
      }
    });
    if (cheapestTicketPrice !== Infinity) {
      discount = cheapestTicketPrice;
    }
  }

  const total = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const snacksPayloadMap = new Map();

      const ticketItems = cart.filter((item) => item.type === "ticket");
      const screeningIds = [
        ...new Set(ticketItems.map((item) => item.screeningId).filter(Boolean)),
      ];
      const ticketQty = ticketItems.reduce(
        (acc, item) => acc + (item.qty || 0),
        0,
      );
      const screeningId = screeningIds[0] || null;
      const seatIdsFromCart = [
        ...new Set(
          ticketItems.flatMap((item) =>
            Array.isArray(item.seatIds) ? item.seatIds : [],
          ),
        ),
      ];
      const resolvedSeatIds =
        seatIdsFromCart.length > 0
          ? seatIdsFromCart
          : screeningId
            ? selectedSeatIdsByScreening[screeningId] || []
            : [];

      if (ticketItems.length === 0) {
        toast.error(
          "Este punto de venta solo admite ventas que incluyan tickets. Agrega al menos una boleta.",
        );
        return;
      }
      if (screeningIds.length === 0) {
        toast.error("Los tickets no tienen una función válida asociada.");
        return;
      }
      if (screeningIds.length > 1) {
        toast.error(
          "Solo se puede procesar una función por venta. Separa los tickets por función.",
        );
        return;
      }
      if (ticketQty > 0 && resolvedSeatIds.length !== ticketQty) {
        toast.error(
          "Debes seleccionar asientos para todas las boletas antes de cobrar.",
        );
        return;
      }

      const seats = resolvedSeatIds.map((id) => ({ idSeat: id }));
      cart.forEach((item) => {
        if (item.type === "snack") {
          if (snacksPayloadMap.has(item.id)) {
            snacksPayloadMap.get(item.id).quantity += item.qty;
          } else {
            snacksPayloadMap.set(item.id, {
              snackId: item.id,
              quantity: item.qty,
              multiplexId: item.multiplexId || user?.multiplexId || null,
            });
          }
        }
      });

      const buyerEmail = activeCustomer ? activeCustomer.email : manualEmail;

      if (!cashOnlyMode && !buyerEmail) {
        toast.error("Debe ingresar un correo electrónico antes de cobrar.");
        return;
      }

      if (cashOnlyMode) {
        saveOrderSnapshot({
          cart,
          cartTotal: total,
          pendingPoints: 0,
          buyerEmail: "cliente.generico",
          shippingInfo: null,
        });
        setShowSuccess(true);
        return;
      }

      const result = await createCheckoutSession(
        screeningId,
        seats,
        Array.from(snacksPayloadMap.values()),
        buyerEmail,
      );

      if (result.sessionUrl) {
        localStorage.setItem(
          "cinepacho_checkout_payload",
          JSON.stringify({
            screeningId,
            seats,
            snacks: Array.from(snacksPayloadMap.values()),
            buyerEmail,
          }),
        );
        if (result.paymentId) {
          localStorage.setItem("cinepacho_payment_id", result.paymentId);
        }
        saveOrderSnapshot({
          cart,
          cartTotal: total,
          pendingPoints: 0,
          buyerEmail,
          shippingInfo: null,
        });
        window.location.href = result.sessionUrl;
      } else {
        toast.error("Error al generar sesión de pago.");
      }
    } catch (err) {
      toast.error("Error al procesar pago: " + err.message);
    }
  };

  const resetPOS = () => {
    setCart([]);
    setActiveCustomer(null);
    setWantsPoints(false);
    setShowSuccess(false);
    setAppliedVoucher(null);
    setVoucherCode("");
    setManualEmail("");
    setSelectedSeatIdsByScreening({});
  };

  const [scanResultUI, setScanResultUI] = useState(null);

  const handleScan = async (result) => {
    if (!result || isScanProcessing) return;
    const billingId = result[0]?.rawValue || result;

    if (billingId) {
      setIsScanProcessing(true);
      try {
        const response = await scanTicket(billingId);
        setScanResultUI({
          type: "success",
          message:
            response?.message || "Entrada válida. Bienvenido a CinePacho",
        });
      } catch (err) {
        setScanResultUI({
          type: "error",
          message: err.message || "Entrada Inválida o ya escaneada",
        });
      } finally {
        setIsScanProcessing(false);
        setTimeout(() => setScanResultUI(null), 4000);
      }
    }
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode) return;
    setValidatingVoucher(true);
    try {
      const data = await validateVoucher(voucherCode);
      toast.success("Cupón validado. Descuento aplicado.");
      setAppliedVoucher(data || true);
    } catch (err) {
      toast.error(err.message || "Cupón inválido o expirado");
      setVoucherCode("");
    } finally {
      setValidatingVoucher(false);
    }
  };

  // FIX 5: Voucher visible con manualEmail también (no solo activeCustomer)
  const canUseVoucher =
    (activeCustomer || manualEmail.includes("@")) &&
    cart.some((i) => i.type === "ticket") &&
    !cashOnlyMode;

  return (
    <div className="min-h-screen bg-carbon text-white flex flex-col h-screen overflow-hidden">
      {/* ── Navbar del Cajero ── */}
      <header className="h-16 bg-surface border-b border-border/50 flex items-center justify-between px-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
            <Ticket size={20} className="text-carbon" />
          </div>
          <div>
            <h1 className="font-display tracking-widest text-lg uppercase text-white leading-none">
              Punto de Venta
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-gold uppercase mt-1">
              Cine Pacho POS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold leading-none">
              {user?.name || "Cajero"}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Sede: {user?.multiplexId || "No asignada"}
            </p>
          </div>
          <button
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-4 py-2 bg-magenta/10 text-magenta hover:bg-magenta/20 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            <QrCode size={16} />
            Escanear QR
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Catálogo (Izquierda) */}
        <div className="flex-1 overflow-hidden flex flex-col bg-carbon/50">
          {/* Tabs */}
          <div className="flex p-6 pb-0 gap-4">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`flex-1 py-4 rounded-t-2xl font-display tracking-widest uppercase transition-colors flex justify-center items-center gap-2 cursor-pointer ${
                activeTab === "tickets"
                  ? "bg-surface border-t border-x border-border/50 text-magenta"
                  : "bg-transparent text-text-secondary border-b border-border/50 hover:text-white"
              }`}
            >
              <Film size={20} /> Películas
            </button>
            <button
              onClick={() => setActiveTab("snacks")}
              className={`flex-1 py-4 rounded-t-2xl font-display tracking-widest uppercase transition-colors flex justify-center items-center gap-2 cursor-pointer ${
                activeTab === "snacks"
                  ? "bg-surface border-t border-x border-border/50 text-gold"
                  : "bg-transparent text-text-secondary border-b border-border/50 hover:text-white"
              }`}
            >
              <Popcorn size={20} /> Snacks
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-surface border-t-0 border-border/50">
            {activeTab === "tickets" && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {movies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie)}
                    className="bg-carbon border border-border/50 rounded-2xl overflow-hidden hover:border-magenta/50 hover:shadow-[0_0_15px_rgba(200,22,122,0.3)] transition-all group cursor-pointer text-left flex flex-col"
                  >
                    <div className="aspect-[2/3] overflow-hidden w-full relative">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        // FIX 2: Fallback if TMDB image fails
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/200x300?text=Sin+imagen";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
                    </div>
                    <div className="p-4 pt-2">
                      <span className="font-bold text-sm text-white line-clamp-1 group-hover:text-magenta transition-colors">
                        {movie.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "snacks" && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {snacks.map((snack) => (
                  <button
                    key={snack.id}
                    onClick={() => handleAddSnackToCart(snack)}
                    className="bg-carbon border border-border/50 rounded-2xl p-5 text-left hover:border-gold/50 hover:bg-gold/5 transition-all group flex flex-col h-32 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Popcorn size={18} className="text-gold" />
                    </div>
                    <span className="font-bold text-sm text-text-primary line-clamp-1">
                      {snack.name}
                    </span>
                    <span className="text-gold font-bold mt-auto">
                      ${snack.price.toLocaleString("es-CO")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral derecho (Cliente y Carrito) */}
        <div className="w-96 bg-surface border-l border-border/50 flex flex-col shrink-0">
          {/* Módulo de Cliente */}
          <div className="p-5 border-b border-border/50">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
              Cliente (Fidelización)
            </h3>

            {activeCustomer ? (
              <div className="bg-carbon border border-green-500/30 rounded-xl p-4 relative">
                <button
                  onClick={() => setActiveCustomer(null)}
                  className="absolute top-2 right-2 text-text-secondary hover:text-red-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">
                      {activeCustomer.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Puntos:{" "}
                      <span className="text-gold font-bold">
                        {activeCustomer.points}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <input
                    id="cash-only-mode"
                    type="checkbox"
                    checked={cashOnlyMode}
                    onChange={() => {
                      setCashOnlyMode((prev) => {
                        const next = !prev;
                        if (next) setActiveCustomer(null);
                        return next;
                      });
                    }}
                    className="mt-1 h-4 w-4 rounded border border-border bg-carbon text-gold focus:ring-gold"
                  />
                  <label
                    htmlFor="cash-only-mode"
                    className="text-sm text-text-secondary"
                  >
                    Cliente genérico (pago en efectivo, sin Stripe)
                  </label>
                </div>
                {cashOnlyMode ? (
                  <p className="text-xs text-text-secondary">
                    Este modo registra la venta como efectivo. No se abrirá
                    Stripe ni se acumularán puntos.
                  </p>
                ) : (
                  <>
                    <input
                      type="email"
                      placeholder="Correo del comprador"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full bg-carbon border border-border/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold transition-colors placeholder-text-secondary"
                    />
                    <p className="text-xs text-text-secondary">
                      Si el cliente no está registrado en la app, ingresa su
                      correo y la compra se procesará normalmente.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Carrito de Compras POS */}
          <div className="flex-1 overflow-y-auto p-5">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
              Orden Actual
            </h3>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-text-secondary">
                <ShoppingCart size={32} className="mb-3 opacity-20" />
                <p className="text-sm">No hay productos en la orden</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.type}-${item.showtime}`}
                      className="bg-carbon rounded-xl p-3 flex items-center justify-between group"
                    >
                      <div className="flex-1 pr-3 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-0.5">
                          ${getUnitPrice(item).toLocaleString("es-CO")} x{" "}
                          {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-bold text-gold">
                          $
                          {(getUnitPrice(item) * item.qty).toLocaleString(
                            "es-CO",
                          )}
                        </p>
                        <button
                          onClick={() => handleRemoveFromCart(item)}
                          className="text-text-secondary hover:text-red-400 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {ticketCount > 0 && (
                  <div className="mt-4 p-4 bg-carbon border border-border/40 rounded-3xl text-sm">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold uppercase tracking-widest text-text-secondary text-[10px]">
                          Asientos
                        </p>
                        <p className="text-white text-xs">
                          Selecciona los asientos para las boletas antes de
                          cobrar.
                        </p>
                      </div>
                      <button
                        onClick={openSeatSelector}
                        className="px-3 py-2 bg-magenta/10 text-magenta border border-magenta/20 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-magenta/20 transition-colors"
                      >
                        {selectedSeatIds.length === ticketCount
                          ? "Cambiar asientos"
                          : "Seleccionar sillas"}
                      </button>
                    </div>
                    <p
                      className={`text-xs ${selectedSeatIds.length === ticketCount ? "text-white/80" : "text-red-400"}`}
                    >
                      {selectedSeatIds.length > 0
                        ? `Asientos seleccionados (${selectedSeatIds.length}/${ticketCount}): ${selectedSeatIds.join(", ")}`
                        : `Aún no se seleccionan los ${ticketCount} asientos requeridos.`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-5 border-t border-border/50 bg-carbon/50 mt-auto">
            {/* FIX 5: Voucher visible con email manual también */}
            {canUseVoucher && (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    value={voucherCode}
                    onChange={(e) =>
                      setVoucherCode(e.target.value.toUpperCase())
                    }
                    className="flex-1 bg-carbon border border-border/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-magenta disabled:opacity-50"
                    disabled={appliedVoucher !== null || validatingVoucher}
                  />
                  {!appliedVoucher ? (
                    <button
                      onClick={handleValidateVoucher}
                      disabled={!voucherCode || validatingVoucher}
                      className="px-4 py-2 bg-gold/10 text-gold hover:bg-gold/20 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {validatingVoucher ? "..." : "Aplicar"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherCode("");
                      }}
                      className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {appliedVoucher && discount > 0 && (
                  <p className="text-xs text-green-400 font-bold mt-2">
                    ¡Cupón aplicado! Descuento: -$
                    {discount.toLocaleString("es-CO")}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">
                Total a pagar
              </span>
              <span className="text-3xl font-display text-white">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>

            {needsSeatSelection && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                Debes seleccionar {ticketCount} asiento
                {ticketCount === 1 ? "" : "s"} para las boletas antes de cobrar.
              </div>
            )}

            {activeCustomer && cart.length > 0 && (
              <div className="mb-4 bg-gold/10 border border-gold/30 rounded-xl p-4">
                <p className="text-xs font-bold text-gold uppercase tracking-widest mb-3">
                  ¿Desea acumular puntos?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWantsPoints(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${wantsPoints ? "bg-gold text-carbon" : "bg-carbon border border-border/50 text-text-secondary hover:text-white"}`}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setWantsPoints(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${!wantsPoints ? "bg-red-500 text-white" : "bg-carbon border border-border/50 text-text-secondary hover:text-white"}`}
                  >
                    No
                  </button>
                </div>
                {wantsPoints && (
                  <p className="text-xs text-gold font-bold mt-3 text-center">
                    🌟 El cliente ganará{" "}
                    <span className="text-white">
                      {POINTS_PER_PURCHASE} puntos
                    </span>
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || needsSeatSelection}
              className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all shadow-lg ${
                cart.length > 0 && !needsSeatSelection
                  ? "bg-gradient-to-r from-gold to-yellow-600 text-carbon shadow-gold/20 hover:opacity-90 cursor-pointer"
                  : "bg-border/50 text-text-secondary cursor-not-allowed"
              }`}
            >
              {cashOnlyMode ? "Cobrar en efectivo" : "Cobrar e Imprimir"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal de Selección de Función ── */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface border border-border/50 rounded-3xl p-6 relative animate-[scaleIn_0.2s_ease-out_forwards]">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white bg-carbon rounded-full p-1 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex gap-6 mb-6">
              <img
                src={selectedMovie.posterUrl}
                alt={selectedMovie.title}
                className="w-24 h-auto rounded-xl object-cover shadow-lg"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/96x144?text=?";
                }}
              />
              <div>
                <h2 className="text-2xl font-display text-white uppercase tracking-widest mb-1">
                  {selectedMovie.title}
                </h2>
                <p className="text-magenta font-bold text-sm">
                  Selecciona una función
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock size={14} /> Horarios Disponibles
                </h3>
                {availableShowtimes.length === 0 ? (
                  <p className="text-text-secondary text-sm">
                    No hay funciones activas para esta película.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableShowtimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setSelectedRoomObj(null);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          selectedTime === time
                            ? "bg-magenta text-white"
                            : "bg-carbon border border-border/50 text-text-secondary hover:border-magenta/50 hover:text-white"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTime && availableRooms.length > 0 && (
                <div>
                  <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest mb-3">
                    Sala
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                    {availableRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoomObj(room)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                          selectedRoomObj?.id === room.id
                            ? "bg-cyan-400 text-carbon"
                            : "bg-carbon border border-border/50 text-text-secondary hover:border-cyan-400/50 hover:text-white"
                        }`}
                      >
                        {room.name}
                      </button>
                    ))}
                  </div>

                  {selectedRoomObj && (
                    <div className="bg-carbon border border-border/50 rounded-xl p-4 text-center mt-4">
                      <p className="font-bold text-white mb-3 text-sm">
                        Selecciona el Formato
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {/* FIX 4: Use formats array built from screening data */}
                        {selectedRoomObj.formats.length > 0 ? (
                          selectedRoomObj.formats.map(
                            ({ fmt, generalPrice }) => (
                              <button
                                key={fmt}
                                onClick={() =>
                                  handleAddTicket(
                                    selectedTime,
                                    fmt,
                                    generalPrice,
                                  )
                                }
                                className="bg-surface hover:bg-magenta/10 border border-border/50 hover:border-magenta/50 text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer text-text-primary hover:text-white"
                              >
                                {fmt}
                                {generalPrice > 0
                                  ? `: $${(generalPrice / 1000).toFixed(0)}k`
                                  : ""}
                              </button>
                            ),
                          )
                        ) : (
                          <button
                            onClick={() =>
                              handleAddTicket(
                                selectedTime,
                                "General",
                                selectedRoomObj.price || 0,
                              )
                            }
                            className="bg-surface hover:bg-magenta/10 border border-border/50 hover:border-magenta/50 text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer text-text-primary hover:text-white"
                          >
                            General
                            {selectedRoomObj.price > 0
                              ? `: $${(selectedRoomObj.price / 1000).toFixed(0)}k`
                              : ""}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Selección de Asientos ── */}
      {isSeatSelectorOpen && ticketScreeningId && ticketRoomId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-surface border border-border/50 rounded-3xl overflow-hidden shadow-2xl">
            <SeatSelector
              onBack={() => setIsSeatSelectorOpen(false)}
              onBack={() => setIsSeatSelectorOpen(false)}
              onConfirm={handleConfirmSeatSelection}
              roomId={ticketRoomId}
              screeningId={ticketScreeningId}
              selectedFormat={ticketFormat}
              maxSeats={ticketCount}
              isLoading={false}
              initialSeats={selectedSeatIds}fv
              generalPrice={ticketItems[0]?.price ?? 0}
              preferentialPrice={ticketItems[0]?.price ?? 0}
            />
          </div>
        </div>
      )}

      {/* ── Modal de Venta Exitosa ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface border border-border/50 rounded-3xl p-8 text-center animate-[scaleIn_0.2s_ease-out_forwards]">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-display text-white tracking-widest uppercase mb-2">
              Venta Exitosa
            </h2>
            <p className="text-text-secondary mb-6">
              Total cobrado:{" "}
              <strong className="text-white">
                ${total.toLocaleString("es-CO")}
              </strong>
            </p>

            {activeCustomer && wantsPoints && (
              <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 mb-6">
                <p className="text-gold font-bold text-sm mb-1">
                  ¡Puntos Asignados!
                </p>
                <p className="text-white text-xs">
                  Se sumaron {POINTS_PER_PURCHASE} pts a la cuenta de{" "}
                  {activeCustomer.name}
                </p>
              </div>
            )}

            <button
              onClick={resetPOS}
              className="w-full bg-carbon border border-border/50 hover:border-gold/50 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      )}

      {/* ── Modal de Escáner QR ── */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border/50 rounded-3xl p-6 relative animate-[scaleIn_0.2s_ease-out_forwards]">
            <button
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white bg-carbon rounded-full p-1 cursor-pointer transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-magenta/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode size={24} className="text-magenta" />
              </div>
              <h2 className="text-xl font-display text-white tracking-widest uppercase mb-1">
                Escanear Entrada
              </h2>
              <p className="text-text-secondary text-sm">
                Ubique el código QR frente a la cámara
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-magenta/30 aspect-square relative">
              {isScanProcessing && (
                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                  <p className="text-white font-bold animate-pulse">
                    Procesando...
                  </p>
                </div>
              )}
              <Scanner
                onScan={handleScan}
                onError={(err) => console.error(err)}
                styles={{ container: { width: "100%", height: "100%" } }}
                components={{ audio: false, finder: false }}
              />
            </div>

            {scanResultUI && (
              <div
                className={`absolute inset-0 rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center animate-[scaleIn_0.3s_ease-out_forwards] ${scanResultUI.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  {scanResultUI.type === "success" ? (
                    <CheckCircle size={48} />
                  ) : (
                    <X size={48} />
                  )}
                </div>
                <h2 className="text-3xl font-display uppercase tracking-widest mb-2 shadow-sm">
                  {scanResultUI.type === "success"
                    ? "¡ACCESO PERMITIDO!"
                    : "ACCESO DENEGADO"}
                </h2>
                <p className="text-lg font-bold shadow-sm">
                  {scanResultUI.message}
                </p>
                <button
                  onClick={() => setScanResultUI(null)}
                  className="mt-8 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Continuar Escaneando
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
