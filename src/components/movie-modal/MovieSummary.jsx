import React from 'react'
import { Star, Clock, Calendar, Clapperboard } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const castData = {
  1: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
  2: 'Timothée Chalamet, Zendaya, Austin Butler, Florence Pugh',
  3: 'Amy Poehler, Maya Hawke, Ayo Edebiri, Kensington Tallman',
  4: 'Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen',
  5: 'Bill Skarsgård, Lily-Rose Depp, Nicholas Hoult, Willem Dafoe',
  6: 'Cynthia Erivo, Ariana Grande, Jeff Goldblum, Michelle Yeoh',
  7: 'Ryan Reynolds, Hugh Jackman, Emma Corrin, Morena Baccarin',
  8: 'Cailee Spaeny, David Jonsson, Archie Renaux, Isabela Merced',
}

export default function MovieSummary({ movie }) {
  const { t } = useLanguage()

  return (
    <>
      <div>
        <h2 id="movie-modal-title" className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-white leading-none mb-3 pr-8">
          {movie.title}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30 text-xs font-bold">
            <Star size={11} fill="currentColor" />
            {movie.rating}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Clock size={11} />
            {movie.duration}
          </span>
          <span className="bg-magenta/10 px-2.5 py-1 rounded-full border border-magenta/30 text-xs font-bold text-magenta">
            {movie.genre}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Calendar size={11} />
            {movie.year}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
        <div>
          <h3 className="text-xs font-display tracking-widest text-magenta mb-1">{t('movie.synopsisLabel')}</h3>
          <p className="text-text-primary/85 text-[13px] leading-relaxed font-body">
            {movie.synopsis}
          </p>
        </div>
        <div className="sm:w-52 bg-carbon/50 p-3.5 rounded-xl border border-white/5 space-y-2">
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase flex items-center gap-1">
              <Clapperboard size={9} /> {t('movie.director')}
            </p>
            <p className="text-white text-sm font-medium">{movie.director}</p>
          </div>
          <div className="h-px bg-border/20" />
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase">{t('movie.cast')}</p>
            <p className="text-white/75 text-[11px] leading-relaxed">
              {castData[movie.id] || t('movie.notAvailable')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
