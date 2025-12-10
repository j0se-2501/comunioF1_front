"use client";

import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";

interface ModalBanderasProps {
  open: boolean;
  onClose: () => void;
  onSelect: (flag: string) => void;
}

const countryCodes = [
  "ES", "FR", "PT", "IT", "DE",
  "GB", "US", "MX", "BR", "AR",
  "CA", "AU", "NZ", "JP", "CN",
  "KR", "IN", "TH", "PH", "SG",
  "MY", "ID", "VN", "TR", "SA",
  "AE", "QA", "ZA", "NG", "EG",
  "MA", "TN", "SE", "NO", "FI",
  "DK", "NL", "BE", "CH", "PL",
];

function codeToEmoji(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join("");
}

export function ModalBanderas({ open, onClose, onSelect }: ModalBanderasProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-lg font-league text-primary mb-3">Elige tu pais</h3>
      <div className="grid grid-cols-5 gap-2">
        {countryCodes.map((code) => {
          const flag = codeToEmoji(code);
          return (
            <button
              key={code}
              type="button"
              className="text-2xl hover:scale-105 transition-transform"
              onClick={() => {
                onSelect(flag);
                onClose();
              }}
            >
              {flag}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}
