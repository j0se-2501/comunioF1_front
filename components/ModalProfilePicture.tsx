"use client";

import Image from "next/image";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";

interface ModalProfilePictureProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const backendBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const helmets = Array.from({ length: 20 }, (_, i) => {
  const idx = (i + 1).toString().padStart(2, "0");
  return {
    display: `/icons/helmet_icons/${idx}.png`, // servidas desde el front
    value: `${backendBase}/images/helmet_icons/${idx}.png`, // lo que guardamos en DB
  };
});

export function ModalProfilePicture({
  open,
  onClose,
  onSelect,
}: ModalProfilePictureProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-lg font-league text-primary mb-3">Elige tu icono</h3>
      <div className="grid grid-cols-5 gap-3">
        {helmets.map((helmet) => (
          <button
            key={helmet.value}
            type="button"
            className="flex items-center justify-center rounded-md bg-white p-2 shadow hover:scale-105 transition-transform"
            onClick={() => {
              onSelect(helmet.value);
              onClose();
            }}
          >
            <Image
              src={helmet.display}
              alt="Icono de perfil"
              width={64}
              height={64}
            />
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}
