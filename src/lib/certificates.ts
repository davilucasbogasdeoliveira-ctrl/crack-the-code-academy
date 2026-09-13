import type { Track } from "@/content/modules";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBlock(size: number): string {
  const bytes = new Uint8Array(size);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Código de validação único de um certificado, ex.: TCA-PYTHON-K7Q2M9-4F3A */
export function makeCertificateCode(track: Track): string {
  const year = new Date().getFullYear().toString().slice(-2);
  return `TCA-${track.toUpperCase()}-${randomBlock(6)}-${year}${randomBlock(2)}`;
}
