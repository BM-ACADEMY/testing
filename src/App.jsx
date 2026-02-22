import { motion, useScroll, useTransform } from 'framer-motion';
import ProductBottleScroll from './components/ProductBottleScroll';

function App() {
    const { scrollYProgress } = useScroll();
    const textOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
    const textScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.5]);
    const blurValue = useTransform(scrollYProgress, [0, 0.1], [0, 20]);
    return (
        <main className="relative bg-zinc-950 font-sans">
            {/* Animation Section - Now the Hero */}
            <ProductBottleScroll
                frameCount={192}
                folderPath="bottle-animation"
            />

            {/* Hero-like Text Overlay with New Animation */}
            <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-center text-center p-6 pointer-events-none z-20">
                <motion.div
                    style={{
                        opacity: textOpacity,
                        scale: textScale,
                        filter: useTransform(blurValue, (v) => `blur(${v}px)`)
                    }}
                    className="relative flex flex-col items-center"
                >
                    <h1
                        className="text-[12vw] md:text-[18vw] font-black tracking-tighter leading-none select-none text-white"
                    >
                        MANGO
                    </h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 1, duration: 1 }}
                        className="h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent mb-4"
                    />
                    <p className="text-zinc-500 text-[2vw] md:text-[1vw] uppercase tracking-[1em] font-light">
                        Pure Essence.
                    </p>
                </motion.div>
            </div>

            {/* Feature Section */}
            <section className="min-h-screen py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-4xl font-bold mb-6">Unparalleled Craftsmanship.</h2>
                    <p className="text-zinc-400 leading-relaxed mb-8">
                        Our bottle design is optimized for both aesthetics and ergonomics.
                        Every curve is carefully calculated for the best grip and visual appeal.
                    </p>
                    <div className="space-y-4">
                        {['100% Recyclable', 'BPA Free', 'Durable Glass', 'Eco-friendly'].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <span className="text-zinc-200 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                    <span className="text-zinc-700 text-sm font-mono tracking-widest">PRODUCT_DETAILS_MOCKUP</span>
                </div>
            </section>

            {/* Bottom Spacer */}
            <section className="h-[50vh] flex items-center justify-center border-t border-zinc-900">
                <p className="text-zinc-600">© 2026 MANGO. All rights reserved.</p>
            </section>
        </main>
    );
}

export default App;
