import React from "react";
import { colors } from "../data/theme";

// Moldura de celular (390px de largura lógica) para as telas Mobile-* (§4).
export const PhoneFrame: React.FC<{
  width: number; // largura total da moldura em px de render
  height: number;
  children: React.ReactNode;
}> = ({ width, height, children }) => {
  const bezel = Math.round(width * 0.03);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: width * 0.13,
        background: "#0A1F1E",
        padding: bezel,
        boxShadow: "0 30px 70px rgba(11,63,61,.28)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: width * 0.1,
          overflow: "hidden",
          background: colors.white,
          position: "relative",
        }}
      >
        {children}
      </div>
      {/* notch */}
      <div
        style={{
          position: "absolute",
          top: bezel + 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: width * 0.32,
          height: 20,
          borderRadius: 999,
          background: "#0A1F1E",
        }}
      />
    </div>
  );
};
