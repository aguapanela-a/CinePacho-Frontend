// También podemos exportar las fechas y horarios mock para uso global en toda la app
export const showtimeDates = [
  { dayKey: 'movie.today', date: '24 Oct' },
  { dayKey: 'movie.tomorrow', date: '25 Oct' },
  { dayKey: 'movie.thursday', date: '26 Oct' },
  { dayKey: 'movie.friday', date: '27 Oct' },
]

export const showtimes = ['14:30', '16:45', '19:15', '21:00', '22:45']

export const ticketFormats = [
  { fmt: '2D', generalPrice: 11000, preferentialPrice: 15000 },
  { fmt: '3D', generalPrice: 15000, preferentialPrice: 19000 },
  { fmt: 'IMAX', generalPrice: 18000, preferentialPrice: 24000 },
]
