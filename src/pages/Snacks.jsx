import React from 'react'
import { Plus, Star } from 'lucide-react'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'

const snacksData = [
  {
    id: 1,
    name: 'Combo Mega Cine',
    description: 'Palomitas gigantes, 2 refrescos grandes y nachos con queso',
    price: '$45.000',
    image: 'https://scontent.fbog2-5.fna.fbcdn.net/v/t39.30808-6/634225208_910555578359897_100885749538904543_n.jpg?stp=dst-jpg_s640x640_tt6&_nc_cat=109&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeGeKapmt8BDsXNEAov3VHxlFvargT2bKvsW9quBPZsq-0HYXtbwdqQaylg0ad--fmcQ1NvfqOf8j4DThEIfU5NA&_nc_ohc=99ZRsjHopEAQ7kNvwH6O4lz&_nc_oc=Adrwroqy_Bk5oO-GlK69PFrjGZQx420ao7nSQCLHC-rJyxMMO9MutlTSSmUgLm8uW7I&_nc_zt=23&_nc_ht=scontent.fbog2-5.fna&_nc_gid=_VwZINZ25mdg02ZjPf-O5w&_nc_ss=7b2a8&oh=00_Af7EvlenmXY00K28XthaBaUDCn5N7PIj62xbAMtRutyxVw&oe=6A01F55D',
    points: 10,
  },
  {
    id: 2,
    name: 'Palomitas Mantequilla (Grandes)',
    description: 'Las clásicas palomitas de cine recién hechas, crujientes con extra sabor a mantequilla.',
    price: '$20.000',
    image: 'https://images.unsplash.com/photo-1691480213129-106b2c7d1ee8?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    points: 5,
  },
  {
    id: 3,
    name: 'Nachos Cine Pacho',
    description: 'Nachos dorados con abundante queso fundido y jalapeños (opcional).',
    price: '$18.000',
    image: 'https://glovo.dhmedia.io/image/menus-glovo/products/87958bca65d92e66ccb82b47c7df20991898e490863041e5c75fb6477b553ad2?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    points: 5,
  },
  {
    id: 4,
    name: 'Combo Pareja',
    description: 'Palomitas grandes, 2 refrescos medianos y 1 perro caliente.',
    price: '$38.000',
    image: 'https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    points: 10,
  },
  {
    id: 5,
    name: 'Refresco Grande',
    description: 'Bebida carbonatada 32oz a elegir (Gaseosas, té, jugos).',
    price: '$12.000',
    image: 'https://images.unsplash.com/photo-1732031750172-1600351813d0?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    points: 5,
  },
  {
    id: 6,
    name: 'Chocolatina Grande',
    description: 'Barra de chocolate premium para acompañar tus palomitas.',
    price: '$8.000',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    points: 5,
  },
]

export default function Snacks() {
  const { addToCart } = useApp()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Cabecera de la sección: Animación de entrada y comunicación de beneficios (Ley de Von Restorff) */}
      <div className="text-center mb-16 animate-[fadeUp_0.5s_ease-out_forwards]">
        <h1 className="text-5xl md:text-6xl font-display uppercase tracking-widest text-white mb-4">
          Snacks & <span className="gradient-brand">Combos</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Completa tu experiencia cinematográfica con los mejores snacks.
          <span className="block mt-2 text-gold font-semibold">
            ¡Recuerda que cada snack que compres te suma puntos Pacho!
          </span>
        </p>
      </div>

      {/* Grilla Adaptativa de Productos: Implementa Ley de Proximidad para agrupar imagen, info y acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {snacksData.map((snack, index) => (
          <div
            key={snack.id}
            className="group relative bg-surface border border-border/50 rounded-3xl overflow-hidden hover:border-magenta/40 transition-all duration-300 hover:shadow-2xl hover:shadow-magenta/20 flex flex-col h-full animate-[fadeUp_0.5s_ease-out_forwards]"
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            {/* Sección Visual: Imagen de producto con overlay on-hover y badge de puntaje */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-carbon/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
              <img
                src={snack.image}
                alt={snack.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Points Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-carbon/80 backdrop-blur-md border border-gold/40 text-gold px-3.5 py-1.5 rounded-full text-sm font-bold shadow-lg">
                <Star size={14} fill="currentColor" />
                <span>+{snack.points} pts</span>
              </div>
            </div>

            {/* Sección de Contenido Transaccional: Detalles, precio y llamado a la acción (CTA) */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-display tracking-wide text-white group-hover:text-magenta transition-colors">
                  {snack.name}
                </h3>
                <span className="text-xl font-bold font-display text-gold">
                  {snack.price}
                </span>
              </div>
              <p className="text-text-secondary text-sm mb-6 flex-1 hidden sm:block">
                {snack.description}
              </p>

              <Button
                variant="secondary"
                className="w-full mt-auto"
                onClick={() => addToCart({ ...snack, type: 'snack' })}
              >
                <Plus size={18} />
                Agregar a orden
              </Button>
            </div>

            {/* Efecto decorativo (Shimmer) que aporta dinamismo sutil sin sobrecargar visualmente */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/5 opacity-40 group-hover:animate-[shimmer_1.5s_infinite]" />
          </div>
        ))}
      </div>
    </div>
  )
}
