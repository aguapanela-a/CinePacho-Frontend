/**
 * Normaliza los datos que vienen del backend para que tengan 
 * siempre el mismo formato antes de llegar al componente.
 */
export const mapMovieData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    // Maneja tanto el objeto con 'movieInfo' (selectors) como el objeto plano (topRated)
    const m = item.movieInfo || item;

    return {
      id: m.idMovie || m.id,
      title: m.originalTitle || m.title || 'Sin Título',
      overview: m.overview || '',
      rating: item.rating || m.rating || 0,
      year: (m.release_date || m.releaseDate || 'N/A').toString().substring(0, 4),
      genre: (m.genres || []).map(g => (typeof g === 'object' ? g.name : g)).join(', ') || 'Acción',
      posterUrl: m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : '/placeholder.jpg',
      backdropUrl: m.backdropPath ? `https://image.tmdb.org/t/p/original${m.backdropPath}` : '',
      // Campos extra para selectores
      screenings: item.screenings || [],
      trailerKey: item.key || null
    };
  });
};