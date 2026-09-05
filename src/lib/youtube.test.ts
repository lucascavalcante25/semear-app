import { describe, expect, it } from "vitest";
import { extrairIdYoutube, urlEmbedYoutube } from "@/lib/youtube";

describe("youtube", () => {
  it("extrai ID de formatos comuns", () => {
    expect(extrairIdYoutube("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extrairIdYoutube("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extrairIdYoutube("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extrairIdYoutube("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("rejeita URL inválida", () => {
    expect(extrairIdYoutube("https://example.com")).toBeNull();
    expect(extrairIdYoutube("")).toBeNull();
  });

  it("monta URL de embed", () => {
    expect(urlEmbedYoutube("dQw4w9WgXcQ")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(urlEmbedYoutube("dQw4w9WgXcQ")).toContain("autoplay=1");
  });
});
