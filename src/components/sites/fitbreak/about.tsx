import Image from "next/image";

import { Icon } from "./icons";
import { asset, cardIn, routes } from "./links";

const stats = [
  { value: "60", label: "Minutes per class" },
  { value: "4", label: "Classes per day" },
  { value: "6", label: "Days a week" },
  { value: "8–12", label: "Women per class" },
];

export function About() {
  return (
    <section id="about" className="bg-linear-to-br from-pink-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">About FitBreak</h2>
            <p className="mb-6 text-lg text-gray-600">
              You juggle being a mother, wife, and a professional. We built FitBreak so you can
              finally put <em>you</em> on the list—without guilt. We redefine the pause as fuel.
              When you stop to move, you return stronger for everyone and everything that matters.
            </p>
            <a
              href={routes.ourStory}
              className="inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Read Our Full Story
              <Icon name="arrowRight" className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-48 overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={asset("/images/fitbreak7.jpg")}
                alt="Women working out together"
                fill
                sizes="(min-width: 1024px) 300px, 50vw"
                className="object-cover object-top"
              />
            </div>
            <div className="relative mt-8 h-48 overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={asset("/images/fitbreak3.jpg")}
                alt="FitBreak yoga mat"
                fill
                sizes="(min-width: 1024px) 300px, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={cardIn(5 + i)}
              className="fb-card-in rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xs transition-shadow hover:shadow-md"
            >
              <p className="mb-2 text-4xl font-bold text-brand-500">{s.value}</p>
              <p className="text-sm text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
