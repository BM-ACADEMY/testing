import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';

const ProductBottleScroll = ({
    frameCount = 192,
    folderPath = 'default'
}) => {
    const sectionRef = useRef(null);
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Track scroll progress of this section
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    // Map scroll (0-1) to frame index (0-191)
    const currentFrame = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);
    // Use a spring for even smoother frame transitions
    const smoothFrame = useSpring(currentFrame, { stiffness: 300, damping: 30, restDelta: 0.001 });

    // Preload images

    useEffect(() => {
        let isMounted = true;
        const loadedImages = [];
        let loadCount = 0;

        const preloadNext = (index) => {
            if (index > frameCount) {
                if (isMounted) {
                    setImages(loadedImages);
                    setIsLoading(false);
                }
                return;
            }

            const img = new Image();
            // Padding frame number to 3 digits as requested (ezgif-frame-001)
            const frameNum = String(index).padStart(3, '0');
            img.src = `/images/${folderPath}/ezgif-frame-${frameNum}.jpg`;

            img.onload = () => {
                loadCount++;
                loadedImages[index - 1] = img;

                // Draw the first frame immediately to avoid black screen
                if (index === 1 && canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const canvasRatio = canvas.width / canvas.height;
                        const imgRatio = img.width / img.height;
                        let drawWidth, drawHeight, offsetX, offsetY;

                        if (canvasRatio > imgRatio) {
                            drawWidth = canvas.width;
                            drawHeight = img.height * (canvas.width / img.width);
                            offsetX = 0;
                            offsetY = (canvas.height - drawHeight) / 2;
                        } else {
                            drawHeight = canvas.height;
                            drawWidth = img.width * (canvas.height / img.height);
                            offsetX = (canvas.width - drawWidth) / 2;
                            offsetY = 0;
                        }
                        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    }
                }

                if (index < frameCount) {
                    preloadNext(index + 1);
                } else if (isMounted) {
                    setImages(loadedImages);
                    setIsLoading(false);
                }
            };

            img.onerror = () => {
                console.error(`Failed to load frame ${frameNum}`);
                // Continue even if one fails
                if (index < frameCount) {
                    preloadNext(index + 1);
                }
            };
        };

        preloadNext(1);

        return () => { isMounted = false; };
    }, [frameCount, folderPath]);

    // Main draw loop
    useEffect(() => {
        if (images.length === 0) return;

        const render = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            // Get current frame index
            const frameIndex = Math.floor(smoothFrame.get());
            const img = images[frameIndex];

            if (img) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Aspect ratio: cover
                const canvasRatio = canvas.width / canvas.height;
                const imgRatio = img.width / img.height;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (canvasRatio > imgRatio) {
                    // Canvas is wider than image: fill width and crop top/bottom
                    drawWidth = canvas.width;
                    drawHeight = img.height * (canvas.width / img.width);
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                } else {
                    // Canvas is taller than image: fill height and crop sides
                    drawHeight = canvas.height;
                    drawWidth = img.width * (canvas.height / img.height);
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }

            requestAnimationFrame(render);
        };

        const animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [images, smoothFrame]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Set canvas size to match visual size (high resolution)
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;

            // Reset scale for drawing
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // We handle DPR manually in draw or letting the CSS size handle it
                // Actually it's simpler to set canvas.width/height to display size
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <section ref={sectionRef} className="relative h-[500vh]">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default ProductBottleScroll;
