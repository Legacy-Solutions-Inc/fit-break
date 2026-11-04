import { IntroVideo } from "./intro-video";
import { Scene } from "./motion/home-scenes";

export function VideoSection() {
  return (
    <Scene kind="video">
      <section data-video-stage className="bg-[#f5f5f7] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-video-heading className="mb-12 text-center md:mb-16">
            <h2 className="mb-5 text-4xl font-semibold tracking-tight text-gray-900 md:text-6xl">
              See FitBreak in Action
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed font-normal text-gray-500 md:text-2xl md:leading-8">
              Experience the energy of our women-only bootcamp. Every class, every rep, every
              victory.
            </p>
          </div>

          <div data-video-frame>
            <IntroVideo />
          </div>

          <p data-video-hint className="mt-8 text-center text-sm tracking-wide text-gray-400">
            Click to play
          </p>
        </div>
      </section>
    </Scene>
  );
}
