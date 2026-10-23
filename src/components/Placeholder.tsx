import React from "react";
import { colors } from "../data/theme";
import { isPlaceholder } from "../data/config";

// Pinta de amarelo qualquer texto que ainda contenha "[" (§10 do PROMPT),
// para o grupo não esquecer de preencher antes da renderização final.
export const Placeholder: React.FC<{
  children: string;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const ph = isPlaceholder(children);
  return (
    <span
      style={{
        ...(ph
          ? {
              background: colors.amberBorder,
              color: "#5a3d00",
              padding: "0.04em 0.3em",
              borderRadius: 6,
              fontWeight: 700,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }
          : {}),
        ...style,
      }}
    >
      {children}
    </span>
  );
};
