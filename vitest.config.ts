import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"], // busca todos los tests
    coverage: {
      provider: "v8",              // cambiar "c8" por "v8"
      reporter: ["text", "lcov"],  // mostrar en consola y generar html
      all: true,                    // incluye todos los archivos
      include: ["src/**/*.ts"],     // archivos a cubrir
      // exclude opcional, si quieres incluir todo no pongas nada
    },
    watch: true,                    // modo watch
  },
});
