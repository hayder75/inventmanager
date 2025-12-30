import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    category: string | null;
}

export default function ProductCard({ product }: { product: ProductCardProps }) {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-primary-100 hover:border-brand-light/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1">
            {/* Image Container - Only show if image exists */}
            {product.imageUrl && (
                <div className="relative h-64 w-full bg-primary-50 overflow-hidden">
                    <img
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.imageUrl}`}
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
            <div className={`p-6 ${!product.imageUrl ? 'pt-6' : ''}`}>
                {/* Category Badge - Show here if no image */}
                {!product.imageUrl && product.category && (
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
                    {product.price && (
                        <span className="text-lg font-bold text-brand">
                            ${parseFloat(product.price.toString()).toFixed(2)}
                        </span>
                    )}
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
