"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import QRCode from "qrcode";

import { routes } from "../links";

/**
 * Check-in QR code for a booking (bookings.js generateQRCode: brand red on
 * white, error-correction level H). The source encoded a fitbreak.ph URL; this
 * clone encodes a link to the member's own bookings page on this site.
 */
export const CheckInQr = forwardRef<HTMLCanvasElement | null, { bookingId: string; size: number }>(
  function CheckInQr({ bookingId, size }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const url = new URL(routes.member.bookings, window.location.origin);
      url.searchParams.set("checkin", bookingId);
      void QRCode.toCanvas(canvas, url.toString(), {
        width: size,
        margin: 0,
        errorCorrectionLevel: "H",
        color: { dark: "#D71E49", light: "#ffffff" },
      });
    }, [bookingId, size]);

    return (
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        role="img"
        aria-label={`Check-in QR code for booking ${bookingId}`}
        style={{ width: size, height: size }}
      />
    );
  },
);
