'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    category: string | null;
    unit: string | null;
}

export default function ProductCard({ product }: { product: ProductCardProps }) {
    // Only initialize loading state if we actually have an imageUrl
    const hasImageUrl = product.imageUrl && product.imageUrl.trim() !== '';
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(hasImageUrl);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Construct image URL properly
    const getImageUrl = () => {
        if (!product.imageUrl || product.imageUrl.trim() === '') return null;
        if (product.imageUrl.startsWith('http')) return product.imageUrl;
        
        // Use API URL from environment or construct from current origin
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                     (typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':5000') : 'http://localhost:5000');
        
        // Remove /api suffix if present, as static files are served at root level
        if (baseUrl.endsWith('/api')) {
            baseUrl = baseUrl.replace(/\/api$/, '');
        }
        
        // Ensure imageUrl starts with /
        const imagePath = product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`;
        return `${baseUrl}${imagePath}`;
    };

    const imageUrl = getImageUrl();
    // Only show image container AFTER image successfully loads (not while loading, not on error)
    const shouldShowImage = imageUrl && imageLoaded && !imageError;

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border-2 border-primary-200 hover:border-brand-light/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1 shadow-sm">
            {/* Hidden image for loading check - only render if we have an imageUrl */}
            {imageUrl && !imageLoaded && !imageError && (
                <img
                    src={imageUrl}
                    alt=""
                    className="hidden"
                    onLoad={() => {
                        setImageLoading(false);
                        setImageLoaded(true);
                    }}
                    onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                        setImageLoaded(false);
                    }}
                />
            )}

            {/* Image Container - Only show AFTER image successfully loads */}
            {shouldShowImage && (
                <div className="relative h-64 w-full bg-primary-50 overflow-hidden">
                    <img
                        src={imageUrl!}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                    {/* Category Badge */}
                    {product.category && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-700 shadow-sm">
                            {product.category}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className={`p-6 ${!shouldShowImage ? 'pt-6' : ''}`}>
                {/* Category Badge - Show here if no image */}
                {!shouldShowImage && product.category && (
                    <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-primary-50 rounded-full text-xs font-semibold text-primary-700">
                            {product.category}
                        </span>
                    </div>
                )}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-primary-900 line-clamp-1 group-hover:text-brand transition-colors">
                        {product.name}
                    </h3>
                    <div className="text-right">
                    {product.price && (
                        <div>
                            <span className="text-lg font-bold text-brand block">
                                ${parseFloat(product.price.toString()).toFixed(2)}
                            </span>
                            {product.unit && product.unit.toLowerCase() === 'pak' && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase">
                                    Pack Price
                                </span>
                            )}
                            {product.unit && product.unit.toLowerCase() !== 'pak' && (
                                <span className="text-xs text-primary-500 font-medium uppercase block mt-1">
                                    per {product.unit === 'pcs' ? 'piece' : product.unit}
                                </span>
                            )}
                        </div>
                    )}
                    </div>
                </div>

                {product.description && (
                    <p className="text-primary-500 text-sm line-clamp-2 mb-4">
                        {product.description}
                    </p>
                )}

                <button className="w-full py-2.5 bg-primary-50 text-primary-700 rounded-xl font-medium hover:bg-brand hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                    <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
                    View Details
                </button>
            </div>
        </div>
    );
}
