import { Express } from "express";

// Import admin routes
import adminProductsRouter from "./admin/products";
import adminCategoryRouter from "./admin/category";

// Import user routes  
import userProductsRouter from "./user/products";
import userCategoryRouter from "./user/category";

// ============ V2 API ROUTES ============

/**
 * Configure V2 API routes
 * @param app Express application instance
 */
export const configureV2Routes = (app: Express) => {
  // Admin routes
  app.use("/api/v2/admin/products", adminProductsRouter);
  app.use("/api/v2/admin/categories", adminCategoryRouter);
  
  // User routes
  app.use("/api/v2/user/products", userProductsRouter);
  app.use("/api/v2/user/categories", userCategoryRouter);
};

/**
 * V2 API Documentation
 */
export const V2_API_DOCS = {
  version: "2.0",
  description: "Movie Streaming Platform API v2",
  baseUrl: "/api/v2",
  
  admin: {
    description: "Admin endpoints - require authentication and admin role",
    baseUrl: "/api/v2/admin",
    endpoints: {
      products: {
        baseUrl: "/api/v2/admin/products",
        endpoints: [
          "GET / - Get all products (admin view)",
          "POST / - Create new product",
          "PUT /:id - Update product",
          "DELETE /:id - Delete product",
          "POST /:id/approve - Approve product",
          "POST /:id/cancel-approve - Cancel approval",
          "POST /bulk/approve - Bulk approve products",
          "DELETE /bulk/delete - Bulk delete products",
          "POST /cache/clear - Clear products cache",
          "GET /export/excel - Export products to Excel"
        ]
      },
      categories: {
        baseUrl: "/api/v2/admin/categories",
        endpoints: [
          "GET / - Get all categories (admin view)",
          "POST / - Create new category",
          "PUT /:id - Update category",
          "DELETE /:id - Delete category (soft delete)",
          "DELETE /:id/permanent - Permanently delete category",
          "POST /:id/restore - Restore category from recycle bin",
          "GET /recycle-bin - Get recycle bin items",
          "POST /:slug/toggle-active - Toggle category active status",
          "PUT /bulk/update - Bulk update categories",
          "POST /cache/clear - Clear category cache",
          "GET /export/excel - Export categories to Excel"
        ]
      }
    }
  },
  
  user: {
    description: "User endpoints - public access, filtered data",
    baseUrl: "/api/v2/user",
    endpoints: {
      products: {
        baseUrl: "/api/v2/user/products",
        endpoints: [
          "GET / - Get all products (approved only)",
          "GET /:id - Get product detail",
          "GET /category/:categoryId - Get products by category",
          "GET /search - Search products",
          "GET /trending - Get trending products",
          "GET /latest - Get latest products",
          "POST /:id/view - Increment view count"
        ]
      },
      categories: {
        baseUrl: "/api/v2/user/categories",
        endpoints: [
          "GET / - Get all categories (active only)",
          "GET /:id - Get category detail",
          "GET /latest - Get latest categories",
          "GET /trending - Get trending categories",
          "GET /search - Search categories",
          "GET /year/:year - Get categories by year",
          "GET /country/:country - Get categories by country",
          "GET /sitemap - Get categories sitemap",
          "GET /upcoming - Get upcoming releases"
        ]
      }
    }
  },
  
  features: {
    authentication: "JWT-based authentication for admin endpoints",
    authorization: "Role-based access control (Admin/SuperAdmin)",
    caching: "Redis caching with automatic invalidation",
    filtering: "Advanced filtering and pagination",
    search: "Full-text search capabilities",
    bulk_operations: "Bulk operations for admin efficiency",
    export: "Excel export functionality",
    soft_delete: "Soft delete with recycle bin",
    versioning: "API versioning support",
    rate_limiting: "Rate limiting for API protection"
  }
};

export default {
  configureV2Routes,
  V2_API_DOCS
};

