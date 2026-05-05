import React, { useState } from 'react'
import { Play, TrendingUp, Star, Clock, Gift } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MovieCard from '../components/MovieCard'
import MovieModal from '../components/MovieModal'
import Button from '../components/Button'

const moviesData = [
  {
    id: 1,
    title: 'Oppenheimer',
    genre: 'Drama / Historia',
    rating: '8.9',
    duration: '3h 00min',
    year: '2023',
    director: 'Christopher Nolan',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec8OysZoxTC.jpg',
    synopsis: 'La asombrosa y paradójica historia del brillante físico J. Robert Oppenheimer, quien debe arriesgarse a destruir el mundo para poder salvarlo.',
  },
  {
    id: 2,
    title: 'Dune: Parte Dos',
    genre: 'Ciencia Ficción',
    rating: '8.6',
    duration: '2h 46min',
    year: '2024',
    director: 'Denis Villeneuve',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc9k1.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    synopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia, enfrentándose a un destino ineludible.',
  },
  {
    id: 3,
    title: 'Intensamente 2',
    genre: 'Animación / Familia',
    rating: '7.8',
    duration: '1h 40min',
    year: '2024',
    director: 'Kelsey Mann',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvZLvOGBkPal.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/stKGOm8UyhuLPR9sLsGAjdjoaA.jpg',
    synopsis: 'Riley entra en la pubertad, y el Cuartel General sufre una repentina reforma para hacerle hueco a algo totalmente inesperado: ¡nuevas emociones como la Ansiedad!',
  },
  {
    id: 4,
    title: 'Gladiador II',
    genre: 'Acción / Drama',
    rating: '7.5',
    duration: '2h 28min',
    year: '2024',
    director: 'Ridley Scott',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg',
    synopsis: 'Años después de presenciar la heroica muerte del venerado Máximo, Lucio adulto se ve obligado a entrar en el Coliseo y luchar por el futuro del Imperio Romano.',
  },
  {
    id: 5,
    title: 'Nosferatu',
    genre: 'Terror / Fantasía',
    rating: '7.3',
    duration: '2h 12min',
    year: '2024',
    director: 'Robert Eggers',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5qGIxdEO841C0tdY0Aw2DJiU20m.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/vIgyYkXkg6NC2whRbYjBD7eb3Er.jpg',
    synopsis: 'Gótica historia de obsesión entre una joven atormentada y un terrorífico y antiguo vampiro de Transilvania enamorado de ella, en medio de la plaga.',
  },
  {
    id: 6,
    title: 'Wicked',
    genre: 'Musical / Fantasía',
    rating: '7.6',
    duration: '2h 40min',
    year: '2024',
    director: 'Jon M. Chu',
    posterUrl: 'https://image.tmdb.org/t/p/w500/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/uLqNE9BcDOkceKAFIhYMYpFEmuA.jpg',
    synopsis: 'La historia no contada de las brujas de Oz. Elphaba, una joven incomprendida por su inusual color de piel verde, y Glinda, la popular chica dorada.',
  },
  {
    id: 7,
    title: 'Deadpool & Wolverine',
    genre: 'Acción / Comedia',
    rating: '7.9',
    duration: '2h 08min',
    year: '2024',
    director: 'Shawn Levy',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    synopsis: 'Un Wade Wilson apático se une a un Wolverine profundamente reacio para salvar su universo, cruzando caminos para cambiar por siempre el MCU de manera épica.',
  },
  {
    id: 8,
    title: 'Alien: Romulus',
    genre: 'Ciencia Ficción / Terror',
    rating: '7.1',
    duration: '1h 59min',
    year: '2024',
    director: 'Fede Álvarez',
    posterUrl: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/9r1BwA2OqM5J1hZIn01tN5Sik7t.jpg',
    synopsis: 'Mientras hurgan en las profundidades de una estación espacial abandonada, un grupo de jóvenes colonizadores se enfrenta cara a cara con la forma de vida más aterradora del universo.',
  },
]

const multiplexes = [
  'Todos',
  'Titán',
  'Unicentro',
  'Plaza Central',
  'Gran Estación',
  'Embajador',
  'Las Américas',
  'Santafé',
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [activePlex, setActivePlex] = useState('Todos')
  const [selectedMovie, setSelectedMovie] = useState(null)

  const filteredMovies = moviesData.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.genre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pb-12">
      {/* Sección Hero: Punto focal primario diseñado para alto impacto visual y conversión inmediata */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        <div className="relative w-full rounded-3xl overflow-hidden min-h-[450px] lg:min-h-[500px] flex items-center bg-carbon border border-border/50 animate-[fadeUp_0.8s_ease-out_forwards]">
          
          {/* Capa Base: Renderizado optimizado del Background principal con overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec8OysZoxTC.jpg"
              alt="Oppenheimer Background"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-magenta/60 via-transparent to-carbon mix-blend-color-burn" />
            <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/80 to-transparent" />
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-magenta/40 blur-[100px] rounded-full" />
          </div>

          {/* Capa de Contenido (Izquierda): Textos e interacciones con Jerarquía tipográfica definida */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 w-full lg:w-3/5">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/40 text-gold px-4 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(212,146,42,0.2)]">
                <Star size={14} fill="currentColor" />
                <span>DESTACADA DE LA SEMANA</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-white tracking-widest drop-shadow-xl font-bold">
                OPPENHEIMER
              </h1>

              <div className="flex items-center gap-3 text-sm text-text-primary font-bold font-display tracking-widest">
                <div className="flex items-center gap-1.5 text-gold">
                  <Clock size={16} />
                  <span>3H 0MIN</span>
                </div>
                <span className="text-border">•</span>
                <span>2023</span>
                <span className="text-border">•</span>
                <span>DRAMA / HISTORIA</span>
              </div>

              <p className="text-text-primary/90 text-sm sm:text-base leading-relaxed max-w-md font-body">
                La asombrosa y paradójica historia del brillante físico J. Robert Oppenheimer, quien debe arriesgarse a destruir el mundo para poder salvarlo.
              </p>

              <div className="pt-2">
                <Button 
                  onClick={() => setSelectedMovie(moviesData[0])}
                  variant="primary" 
                  size="lg" 
                  className="rounded-2xl px-8 shadow-[0_0_30px_rgba(200,22,122,0.4)] hover:shadow-[0_0_40px_rgba(200,22,122,0.6)]"
                >
                  <Play size={18} fill="currentColor" />
                  VER DETALLES Y HORARIOS
                </Button>
              </div>
            </div>
          </div>

          {/* Overlay Decorativo (Derecha): Tarjeta interactiva con Floating Animation (Aislamiento visual) */}
          <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 z-20 animate-[float_6s_ease-in-out_infinite]">
            <div className="relative w-64 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-magenta/20 bg-carbon cursor-pointer" onClick={() => setSelectedMovie(moviesData[0])}>
              <img 
                src="https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" 
                alt="Oppenheimer Poster" 
                className="w-full h-auto hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-carbon/90 backdrop-blur-md border border-gold/50 text-gold px-3 py-1 rounded-full text-xs font-bold glow-gold">
                <Gift size={14} className="text-gold" />
                <span>+10 PTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Componentes de Filtrado de Inventario: Sistema de búsqueda bidireccional (Texto/Sedes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-30 -mt-6">
        <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-xl space-y-6">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o género..."
          />

          <div className="flex flex-wrap justify-center gap-2">
            {multiplexes.map((plex) => (
              <button
                key={plex}
                onClick={() => setActivePlex(plex)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer border ${
                  activePlex === plex
                    ? 'bg-gradient-to-r from-magenta to-vinotinto text-white border-magenta/50 shadow-[0_0_15px_rgba(200,22,122,0.4)]'
                    : 'bg-surface border-border/80 text-text-secondary hover:text-white hover:border-magenta/50'
                }`}
              >
                {plex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Principal de Inventario (Cartelera) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-display tracking-widest text-white uppercase">
              En <span className="gradient-brand">Cartelera</span>
            </h2>
            <p className="text-sm font-medium text-text-secondary mt-1 tracking-wide">
              Descubre las mejores películas del momento
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-magenta font-bold cursor-pointer hover:text-white transition-colors">
            Ver todo
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredMovies.map((movie, index) => (
            <div key={movie.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-[fadeUp_0.8s_ease-out_forwards]">
               <MovieCard movie={movie} onClick={() => setSelectedMovie(movie)} />
            </div>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-24 animate-[fadeUp_0.8s_ease-out_forwards]">
            <p className="text-text-secondary text-xl font-display tracking-widest">
              No se encontraron películas para "<span className="text-white">{search}</span>"
            </p>
          </div>
        )}
      </section>

      {/* Renderizado Condicional del Modal: Controlado por el estado local setSelectedMovie */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  )
}
