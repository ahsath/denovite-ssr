import { fromFileUrl, resolve, dirname } from "@std/path";
import { createServer as createViteServer } from "vite";
import express from "express";
import { Liquid } from "liquidjs";

const prod = Deno.env.get("NODE_ENV") === "production";

const app = express();

const __dirname = dirname(fromFileUrl(import.meta.url));
const root = resolve(__dirname, "..");

// Initialize LiquidJS
const liquid = new Liquid({
  root: resolve(__dirname, "views"),
  extname: ".liquid",
  // cache: process.env.NODE_ENV === "production",
});

app.engine("liquid", liquid.express());
app.set("views", resolve(__dirname, "views"));
app.set("view engine", "liquid");

// Mock data for products (in a real app, this would come from a database)
const mockProducts = [
  {
    id: 1,
    name: "Premium Headphones",
    price: 199.99,
    description: "High-quality wireless headphones with noise cancellation.",
    image: "/images/product1.jpg",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 299.99,
    description: "Feature-rich smartwatch with health tracking capabilities.",
    image: "/images/product2.jpg",
  },
  {
    id: 3,
    name: "Wireless Speaker",
    price: 149.99,
    description: "Portable Bluetooth speaker with premium sound quality.",
    image: "/images/product3.jpg",
  },
  {
    id: 4,
    name: "Laptop Backpack",
    price: 79.99,
    description: "Durable laptop backpack with multiple compartments.",
    image: "/images/product4.jpg",
  },
];

// Create Vite server in middleware mode
const vite = await createViteServer({
  root,
  configFile: "client/vite.config.ts",
  server: {
    middlewareMode: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  appType: "custom",
});

// Use vite's connect instance as middleware
app.use(vite.middlewares);

// Serve static files from the public directory
app.use(express.static(resolve(__dirname, "public")));

// Home page route
app.get("/", async (_req, res, next) => {
  try {
    // Render the home page with LiquidJS
    const html = await liquid.renderFile("pages/home", {
      title: "Home - Marketplace",
      products: mockProducts,
    });

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    if (e instanceof Error) {
      vite.ssrFixStacktrace(e);
    }
    next(e);
  }
});

// Admin SPA route
app.get("/admin", (req, res, next) => {
  try {
    res.render("admin", {}, async (err, html) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error rendering admin page");
      }

      // Apply Vite HTML transforms
      const transformedHtml = await vite.transformIndexHtml(
        req.originalUrl,
        html
      );

      res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
    });
  } catch (e) {
    if (e instanceof Error) {
      vite.ssrFixStacktrace(e);
    }
    next(e);
  }
});

// Products page route
// app.get("/products", async (_req, res, next) => {
//   try {
//     // Render the products page with LiquidJS
//     const html = await liquid.renderFile("pages/products", {
//       title: "Products - Marketplace",
//       products: mockProducts,
//     });

//     res.status(200).set({ "Content-Type": "text/html" }).end(html);
//   } catch (e) {
//     if (e instanceof Error) {
//       vite.ssrFixStacktrace(e);
//     }
//     next(e);
//   }
// });

// // Product detail page route
// app.get("/products/:id", async (req, res, next) => {
//   try {
//     const productId = parseInt(req.params.id);
//     const product = mockProducts.find((p) => p.id === productId);

//     if (!product) {
//       return res.status(404).send("Product not found");
//     }

//     // Render the product detail page with LiquidJS
//     const html = await liquid.renderFile("pages/product-detail", {
//       title: `${product.name} - Marketplace`,
//       product,
//     });

//     res.status(200).set({ "Content-Type": "text/html" }).end(html);
//   } catch (e) {
//     if (e instanceof Error) {
//       vite.ssrFixStacktrace(e);
//     }
//     next(e);
//   }
// });

// app.get("/products/:id", async (req, res) => {
//   const productId = parseInt(req.params.id);
//   const product = mockProducts.find((p) => p.id === productId);

//   if (!product) {
//     res.status(404).send("Product not found");
//   } else {
//     // Render the product detail page with LiquidJS
//     const html = await liquid.renderFile("pages/product-detail", {
//       title: `${product.name} - Marketplace`,
//       product,
//     });

//     res.status(200).set({ "Content-Type": "text/html" }).end(html);
//   }
// });

// Express 5 uses Promise-based error handling
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).send("Something broke!");
  }
);

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
