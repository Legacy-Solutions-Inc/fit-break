import Image from "next/image";
import Link from "next/link";

import { Icon } from "../icons";
import { asset, routes } from "../links";
import { AuthPanel, type AuthMode } from "./auth-panel";

const perks = [
  "Coach-led bootcamp classes",
  "Small group sessions (8-12 women)",
  "Pay via GCash - no hassle",
];

/**
 * Full-screen sign-in / sign-up, cloned from fitbreak.ph/login.html: brand
 * panel over a photo on the left (lg+), the auth form on the right.
 */
export function LoginScreen({
  mode,
  next,
  initialError,
}: {
  mode: AuthMode;
  next: string;
  initialError?: string;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-brand-50 via-white to-brand-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding (hidden on mobile) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-brand-500 to-brand-600 p-12 lg:flex lg:w-1/2">
          <div className="absolute inset-0">
            <Image
              src={asset("/images/fitbreak4.jpg")}
              alt=""
              fill
              priority
              sizes="50vw"
              className="object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <Link href={routes.home}>
                <Image
                  src={asset("/images/fitbreak-logo-white.png")}
                  alt="FitBreak"
                  width={1452}
                  height={1036}
                  priority
                  className="h-14 w-auto"
                />
              </Link>
            </div>

            <div className="text-white">
              <h1 className="mb-4 text-4xl font-bold">
                Strong Women,
                <br />
                Strong Lives.
              </h1>
              <p className="mb-8 text-xl text-white/80">
                Join the women-only fitness community in Calapan City.
              </p>

              <div className="space-y-4">
                {perks.map((perk) => (
                  <div key={perk} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <Icon name="check" className="h-5 w-5" />
                    </div>
                    <span className="text-lg">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-white/60">
              2nd Floor Roxas Drive, Brgy Ilaya, Calapan City
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 text-center lg:hidden">
              <Link href={routes.home} className="inline-block">
                <Image
                  src={asset("/images/fitbreak-landscape-logo.png")}
                  alt="FitBreak"
                  width={1444}
                  height={343}
                  className="mx-auto h-14 w-auto"
                />
              </Link>
            </div>

            <AuthPanel initialError={initialError} initialMode={mode} next={next} />

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link href={routes.home} className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
