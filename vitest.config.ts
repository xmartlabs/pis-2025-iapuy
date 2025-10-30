import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), 
    },
  },
  test: {
    include: ["src/**/*.test.ts"], 
    coverage: {
      provider: "v8",              
      reporter: ["text", "lcov"],  
      all: true,                    
      include: ["src/app/api/**/*.ts"],     
      exclude: [                           
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.config.ts",
        "**/route.ts",
        "**/*.dto.ts"
      ],
    },
    watch: true,                    
  },
});