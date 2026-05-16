import { Link } from 'react-router-dom';
import { heroImageUrl } from '../api/resources.js';

/**
 * @file components/HeroCard.jsx
 * @description Tarjeta individual de un héroe en el grid. Usa el endpoint
 * proxy del backend (`/api/heroes/:id/image`) para mostrar la imagen sin
 * problemas de hotlinking.
 *
 * @param {{ hero: {
 *   id: number, name: string, image_url?: string|null,
 *   alignment?: 'good'|'bad'|'neutral'|'unknown', publisher?: string|null
 * } }} props
 */
function HeroCard({ hero }) {
    return (
        <Link to={`/heroes/${hero.id}`} className="hero-card">
            <img
                src={heroImageUrl(hero.id)}
                alt={hero.name}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder.svg';
                }}
            />
            <div className="hero-card-body">
                <h3>{hero.name}</h3>
                <div className="hero-card-meta">
                    {hero.alignment && (
                        <span className={`tag ${hero.alignment}`}>{hero.alignment}</span>
                    )}
                    {hero.publisher && (
                        <span className="publisher">{hero.publisher}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default HeroCard;
