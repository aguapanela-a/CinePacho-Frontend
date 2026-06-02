import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Film,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Clapperboard,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  searchMovies,
  selectMovie,
  createScreening,
  updateScreeningStatus,
  getMovieSelectorsByMultiplex,
} from "../../services/movieService";
import {
  getAllMultiplexes,
  getMultiplexById,
} from "../../services/multiplexService";

// ── Constantes ──────────────────────────────────────────────────────────────
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w342";
const STATUS_CONFIG = {
  ACTIVE: {
    label: "Activa",
    icon: CheckCircle,
    cls: "bg-green-500/15 text-green-400 border-green-500/20",
  },
  CANCELLED: {
    label: "Cancelada",
    icon: XCircle,
    cls: "bg-red-500/15 text-red-400 border-red-500/20",
  },
  COMPLETED: {
    label: "Completada",
    icon: Clock,
    cls: "bg-text-secondary/15 text-text-secondary border-border/40",
  },
};
const GENRES = [
  { id: 28, name: "Acción" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animación" },
  { id: 35, name: "Comedia" },
  { id: 80, name: "Crimen" },
  { id: 99, name: "Documental" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Familia" },
  { id: 14, name: "Fantasía" },
  { id: 36, name: "Historia" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Misterio" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ciencia ficción" },
  { id: 10770, name: "Película de TV" },
  { id: 53, name: "Suspenso" },
  { id: 10752, name: "Bélica" },
  { id: 37, name: "Oeste" },
];

export default function AdminMovies() {
  const [tab, setTab] = useState("buscar");

  // ── Tab 1: Buscar ──────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null); // película confirmada
  const [selectingId, setSelectingId] = useState(null);
  const debounceRef = useRef(null);
  const [screeningForm, setScreeningForm] = useState(() => {
    const saved = localStorage.getItem("screeningForm");
    return saved
      ? JSON.parse(saved)
      : { multiplexName: "", multiplexId: "", roomId: "" };
    });
  useEffect(() => {
    localStorage.setItem("screeningForm", JSON.stringify(screeningForm));
  }, [screeningForm]);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const data = await searchMovies(q);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }, []);

  const genreMap = Object.fromEntries(GENRES.map((g) => [g.id, g.name]));

  const onQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 500);
  };

  const handleSelectMovie = async (movie) => {
    setSelectingId(movie.id);
    try {
      const res = await selectMovie(movie.id);
      setSelectedMovie({ ...movie, ...res });
      setTab("crear");
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSelectingId(null);
    }
  };

  // ── Tab 2: Crear función ───────────────────────────────────────────────
  const [multiplexes, setMultiplexes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingMultiplexes, setLoadingMultiplexes] = useState(false);
  const [creatingScreening, setCreatingScreening] = useState(false);
  const [screeningError, setScreeningError] = useState(null);
  const [createdScreening, setCreatedScreening] = useState(null);

  useEffect(() => {
    const loadMultiplexes = async () => {
      setLoadingMultiplexes(true);
      try {
        const data = await getAllMultiplexes();
        setMultiplexes(data || []);
      } catch {
        /* no-op */
      } finally {
        setLoadingMultiplexes(false);
      }
    };
    loadMultiplexes();
  }, []);

  const onMultiplexChange = async (e) => {
    const plex = multiplexes.find((m) => m.idMultiplex === e.target.value);
    if (!plex) {
      setScreeningForm((f) => ({
        ...f,
        multiplexName: "",
        multiplexId: "",
        roomId: "",
      }));
      setRooms([]);
      setScreenings([]);
      return;
    }
    setScreeningForm((f) => ({
      ...f,
      multiplexName: plex.nameMultiplex,
      multiplexId: plex.idMultiplex,
      roomId: "",
    }));
    try {
      const detail = await getMultiplexById(plex.idMultiplex);
      setRooms(detail?.rooms || []);

      const movieSelectors = await getMovieSelectorsByMultiplex(
        plex.idMultiplex,
      );

      const flattenedScreenings = [];
      if (movieSelectors && Array.isArray(movieSelectors)) {
        movieSelectors.forEach((selector) => {
          const movie = selector.movieInfo;
          const globalRating = selector.rating;
          const genresList = movie.genreIds
            ? movie.genreIds.map((g) => g.name)
            : [];

          if (selector.screenings && Array.isArray(selector.screenings)) {
            selector.screenings.forEach((scr) => {
              flattenedScreenings.push({
                screeningId: scr.screeningId,
                dateTime: scr.screeningDate,
                originalLanguage: movie.originalLanguage,
                originalTitle: movie.originalTitle,
                overview: movie.overview,
                rating: globalRating,
                status: scr.status,
                genres: genresList,
                format: scr.format || "2D",
                multiplexName: plex.nameMultiplex,
                price: scr.price || 0,
              });
            });
          }
        }); // Aquí se cierra el forEach correctamente
      }
      flattenedScreenings.sort(
        (a, b) => new Date(b.dateTime) - new Date(a.dateTime),
      );
      setScreenings(flattenedScreenings);
    } catch (error) {
      console.error(
        "Error al cargar la información y funciones del multiplex:",
        error,
      );
      setRooms([]);
      setScreenings([]);
    }
  };

  const handleCreateScreening = async () => {
    const { multiplexName, roomId, dateTime, price, format } = screeningForm;
    if (
      !selectedMovie ||
      !multiplexName ||
      !roomId ||
      !dateTime ||
      !price ||
      !format
    ) {
      setScreeningError(
        "Completa todos los campos. Asegúrate de haber seleccionado una película primero.",
      );
      return;
    }
    if (!selectedMovie.id) {
      setScreeningError(
        'Selecciona una película válida en la pestaña "Buscar".',
      );
      return;
    }
    setCreatingScreening(true);
    setScreeningError(null);
    try {
      const result = await createScreening({
        movieId: selectedMovie.id,
        roomId,
        dateTime: dateTime.replace("T", " ") + ":00",
        price: parseFloat(price),
        format,
      });
      setCreatedScreening(result);
      // Añadir a la lista de funciones local
      setScreenings((prev) => [
        ...prev,
        {
          ...result,
          multiplexName,
          format,
          originalTitle: selectedMovie.title,
        },
      ]);
    } catch (err) {
      setScreeningError(err.message);
    } finally {
      setCreatingScreening(false);
    }
  };

  // ── Tab 3: Gestionar funciones ─────────────────────────────────────────
  const [screenings, setScreenings] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [screeningsError, setScreeningsError] = useState(null);

  const handleStatusChange = async (screening, newStatus) => {
    setUpdatingId(screening.screeningId);
    setScreeningsError(null);
    try {
      await updateScreeningStatus(screening.screeningId, newStatus);
      setScreenings((prev) =>
        prev.map((s) =>
          s.screeningId === screening.screeningId
            ? { ...s, status: newStatus }
            : s,
        ),
      );
    } catch (err) {
      setScreeningsError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="mb-8 animate-[fadeUp_0.5s_ease-out_forwards]">
        <h1 className="text-5xl font-display uppercase tracking-widest text-white">
          <span className="gradient-brand">Películas</span> & Funciones
        </h1>
        <p className="text-text-secondary mt-2">
          Gestión de cartelera y programación de funciones
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-surface/50 border border-border/50 p-1.5 rounded-2xl w-fit">
        {[
          { id: "buscar", label: "Buscar Película", icon: Search },
          { id: "crear", label: "Crear Función", icon: Clapperboard },
          { id: "funciones", label: "Mis Funciones", icon: Film },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === id
                ? "bg-gradient-to-r from-magenta to-vinotinto text-white shadow-md shadow-magenta/20"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ──────────────────────── TAB 1: BUSCAR ──────────────────────── */}
      {tab === "buscar" && (
        <div className="animate-[fadeUp_0.4s_ease-out_forwards]">
          {/* Barra de búsqueda */}
          <div className="relative mb-8 max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              value={query}
              onChange={onQueryChange}
              placeholder="Buscar película... (ej: Dune, Interstellar)"
              className="w-full bg-surface border border-border/50 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-magenta transition-colors"
            />
            {searching && (
              <Loader2
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-magenta animate-spin"
              />
            )}
          </div>

          {/* Película seleccionada */}
          {selectedMovie && (
            <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-3">
              <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
              <span className="text-green-400 font-bold">
                {selectedMovie.title}
              </span>
              <span className="text-text-secondary text-sm">
                seleccionada. Ve a "Crear Función" para programarla.
              </span>
            </div>
          )}

          {searchError && (
            <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 mb-6">
              <AlertCircle size={18} /> {searchError}
            </div>
          )}

          {/* Resultados */}
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="group bg-surface/80 border border-border/50 rounded-2xl overflow-hidden hover:border-magenta/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-magenta/10"
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] bg-carbon overflow-hidden rounded-t-2xl">
                    {movie.backdrop_path ? (
                      <img
                        src={`${TMDB_IMAGE}${movie.backdrop_path}`}
                        alt={movie.originalTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={32} className="text-border" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <button
                        onClick={() => handleSelectMovie(movie)}
                        disabled={selectingId === movie.id}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-magenta to-vinotinto text-white text-xs font-bold disabled:opacity-60"
                      >
                        {selectingId === movie.id ? (
                          <Loader2 size={14} className="animate-spin mx-auto" />
                        ) : (
                          "Seleccionar"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-white text-xs font-bold truncate">
                      {movie.title}
                    </p>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {movie.genre_ids
                        ?.map((id) => genreMap[id])
                        .filter(Boolean)
                        .join(", ") || "Género desconocido"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !searching &&
            query && (
              <div className="text-center py-16 text-text-secondary">
                <Film size={40} className="mx-auto mb-3 opacity-30" />
                <p>
                  No se encontraron resultados para "
                  <span className="text-white">{query}</span>"
                </p>
              </div>
            )
          )}

          {!query && (
            <div className="text-center py-20 text-text-secondary">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">
                Escribe el título de una película para buscarla
              </p>
              <p className="text-sm mt-2 opacity-60">
                Búsqueda en tiempo real vía TMDB
              </p>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────── TAB 2: CREAR FUNCIÓN ──────────────────── */}
      {tab === "crear" && (
        <div className="max-w-2xl animate-[fadeUp_0.4s_ease-out_forwards]">
          {!selectedMovie && (
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-2xl px-5 py-4 mb-6">
              <AlertCircle size={18} />
              Primero busca y selecciona una película en la pestaña{" "}
              <strong>Buscar Película</strong>.
            </div>
          )}

          {selectedMovie && (
            <div className="flex items-center gap-4 bg-surface/50 border border-border/50 rounded-2xl p-4 mb-6">
              {selectedMovie.backdrop_path && (
                <img
                  src={`${TMDB_IMAGE}${selectedMovie.backdrop_path}`}
                  alt={selectedMovie.title}
                  className="w-12 h-16 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-widest">
                  Película seleccionada
                </p>
                <p className="text-white font-bold text-lg">
                  {selectedMovie.title}
                </p>
                {selectedMovie.director && (
                  <p className="text-text-secondary text-sm">
                    Dir: {selectedMovie.director}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-surface/50 border border-border/50 rounded-3xl p-6 space-y-5">
            {/* Multiplex */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Multiplex
              </label>
              {loadingMultiplexes ? (
                <div className="flex items-center gap-2 text-text-secondary text-sm py-3">
                  <Loader2 size={14} className="animate-spin" /> Cargando
                  multiplex...
                </div>
              ) : (
                <select
                  value={screeningForm.multiplexId}
                  onChange={onMultiplexChange}
                  className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                >
                  <option value="">Seleccionar multiplex</option>
                  {multiplexes.map((m) => (
                    <option key={m.idMultiplex} value={m.idMultiplex}>
                      {m.nameMultiplex}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Sala */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Sala
              </label>
              <select
                value={screeningForm.roomId}
                onChange={(e) =>
                  setScreeningForm((f) => ({ ...f, roomId: e.target.value }))
                }
                className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors disabled:opacity-50"
                disabled={rooms.length === 0}
              >
                <option value="">
                  {rooms.length === 0
                    ? "Selecciona un multiplex primero"
                    : "Seleccionar sala"}
                </option>
                {rooms.map((r) => (
                  <option key={r.idRoom} value={r.idRoom}>
                    Sala #{r.numberRoom} — {r.seats?.totalAvailable ?? "?"}{" "}
                    asientos disponibles
                  </option>
                ))}
              </select>
            </div>

            {/* Formato (CORRECCIÓN) */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Formato de la función
              </label>
              <select
                value={screeningForm.format}
                onChange={(e) =>
                  setScreeningForm((f) => ({ ...f, format: e.target.value }))
                }
                className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
              >
                <option value="FORMAT_2D">2D</option>
                <option value="FORMAT_3D">3D</option>
                <option value="FORMAT_IMAX">IMAX</option>
              </select>
            </div>

            {/* Fecha y hora */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                value={screeningForm.dateTime}
                onChange={(e) =>
                  setScreeningForm((f) => ({ ...f, dateTime: e.target.value }))
                }
                className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta text-white transition-colors"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
                Precio de la boleta ($)
              </label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={screeningForm.price}
                  onChange={(e) =>
                    setScreeningForm((f) => ({ ...f, price: e.target.value }))
                  }
                  className="w-full bg-carbon border border-border/50 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-magenta text-white transition-colors"
                  placeholder="15000"
                />
              </div>
            </div>

            {/* Erreores de creación */}
            {screeningError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} /> {screeningError}
              </div>
            )}

            {createdScreening && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4">
                <p className="text-green-400 font-bold flex items-center gap-2">
                  <CheckCircle size={16} /> Función creada exitosamente
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  ID:{" "}
                  <span className="text-white font-mono text-xs">
                    {createdScreening.screeningId}
                  </span>
                </p>
              </div>
            )}

            <button
              onClick={handleCreateScreening}
              disabled={creatingScreening || !selectedMovie}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingScreening ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Clapperboard size={18} />
              )}
              Crear Función
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────── TAB 3: GESTIONAR FUNCIONES ─────────────── */}
      {tab === "funciones" && (
        <div className="animate-[fadeUp_0.4s_ease-out_forwards]">
          {screeningsError && (
            <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 mb-6">
              <AlertCircle size={18} /> {screeningsError}
            </div>
          )}

          {screenings.length === 0 ? (
            <div className="text-center py-24 text-text-secondary">
              <Clapperboard size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">
                No hay funciones creadas en esta sesión.
              </p>
              <p className="text-sm mt-2 opacity-60">
                Las funciones creadas en la pestaña anterior aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="bg-surface/50 border border-border/50 rounded-3xl overflow-hidden w-full max-w-full">
              <div className="overflow-x-auto w-full max-w-full">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50">
                      {[
                        "Película",
                        "Multiplex",
                        "Fecha / Hora",
                        "Formato", // ◄ ¡Añade esto aquí!
                        "Precio",
                        "Estado",
                        "Cambiar Estado",
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-4 px-4 text-xs font-bold text-text-secondary uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {screenings.map((sc) => {
                      const cfg =
                        STATUS_CONFIG[sc.status] || STATUS_CONFIG.ACTIVE;
                      const Icon = cfg.icon;
                      return (
                        <tr
                          key={sc.screeningId}
                          className="hover:bg-carbon/40 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <p className="font-bold text-white">
                              {sc.originalTitle}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-sm text-text-secondary">
                            {sc.multiplexName}
                          </td>
                          <td className="py-4 px-4 text-sm text-text-secondary font-mono">
                            {sc.dateTime}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface border border-border/50 text-white">
                              {sc.format ?? "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gold font-bold">
                            ${Number(sc.price).toLocaleString("es-CO")}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}
                            >
                              <Icon size={11} /> {cfg.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="relative">
                              <select
                                value={sc.status}
                                onChange={(e) =>
                                  handleStatusChange(sc, e.target.value)
                                }
                                disabled={updatingId === sc.screeningId}
                                className="bg-carbon border border-border/50 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-magenta transition-colors cursor-pointer disabled:opacity-50 pr-8 appearance-none"
                              >
                                <option value="ACTIVE">Activa</option>
                                <option value="CANCELLED">Cancelada</option>
                                <option value="COMPLETED">Completada</option>
                              </select>
                              {updatingId === sc.screeningId ? (
                                <Loader2
                                  size={12}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-magenta"
                                />
                              ) : (
                                <ChevronDown
                                  size={12}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
