import { AnimatedListDemo } from '@/components/Animated-list-jc';

export function DisappearSection() {
    return (
        <section className="py-12 md:py-24 bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-12 items-center">

                    {/* Text Content */}
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <span className="text-amber-700 font-medium tracking-widest text-sm uppercase">
                            Transformation
                        </span>
                        <h2 className="text-3xl md:text-5xl font-serif text-stone-900 mt-4 mb-6 leading-tight">
                            Tout ce que vous allez
                            <span className="block italic text-stone-500">voir disparaître</span>
                        </h2>
                        <div className="w-24 h-1 bg-amber-600 rounded-full opacity-60 mx-auto md:mx-0 mb-6"></div>
                        <p className="text-stone-600 leading-relaxed">
                            Ces frustrations qui vous freinent aujourd&apos;hui appartiendront bientôt au passé.
                        </p>
                    </div>

                    {/* Animated List */}
                    <div className="w-full md:w-1/2 flex items-center justify-center">
                        <AnimatedListDemo />
                    </div>
                </div>
            </div>
        </section>
    );
}
