import { SectionHead, wrap } from "./editorial";
import { IntroVideo } from "./intro-video";
import { Scene } from "./motion/home-scenes";

export function VideoSection() {
  return (
    <Scene kind="video">
      <section data-video-stage className="bg-paper py-20 md:py-28">
        <div className={wrap}>
          <div data-video-heading className="mb-12 md:mb-16">
            <SectionHead
              label="The studio, in motion"
              title="See FitBreak in Action"
              aside="Experience the energy of our women-only bootcamp. Every class, every rep, every victory."
            />
          </div>

          <div data-video-frame>
            <IntroVideo />
          </div>

          <p data-video-hint className="fb-label mt-6 text-mute">
            Click to play — sound on
          </p>
        </div>
      </section>
    </Scene>
  );
}
