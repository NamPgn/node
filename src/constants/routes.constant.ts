export const API_PREFIX = '/api';

export const ROUTES = {
  AUTH: {
    ROOT: '/auth',
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH: '/refresh',
    LOGOUT: '/logout',
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    VERIFY_TOKEN: '/verify-token'
  },
  USER: {
    ROOT: '/user',
    DETAIL: '/:id',
    USER_ONE: '/user_one/:id',
    REMOVE: '/remove/:id/:userId',
    UPDATE: '/user/:id/:userId',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:id/:token',
    GET_AUTH: '/:id',
    EDIT: '/:id/:userId',
    GET_USER_CART: '/cart/user/:userId',
    
  },
  CATEGORY: {
    ROOT: '/category',
    DETAIL: '/:id',
    PRODUCTS: '/category/products',
    LATEST: '/category/latest',
    LATEST_NEXT: '/category/latest/next',
    SEARCH: '/categorys/search',
    FILTER: '/category/filters',
    CHANGE_LATEST: '/category/changeLatest',
    ALL: '/categorys',
    ALL_NOT_REQ: '/category/getAllCategoryNotRequest/:id',
    ADD: '/category/:userId',
    UPDATE: '/category/:id/:userId',
    DELETE: '/category/:id/:userId',
    WEEK: '/category/week/:id/:userId',
    RATING: {
      ADD: '/rating/:categoryId',
      GET: '/rate/:categoryId',
      STATS: '/rating/stats'
    },
    RELEASES: '/categorys/releases',
    SITEMAP: '/categorys/sitemap',
  },
  PRODUCTS: {
    ROOT: '/products',
    DETAIL: '/product/:id',
    FILTER: '/product/filter',
    SEARCH: '/product/v',
    BY_CATEGORY: '/category/products/:id',
    COMMENTS: '/product/comments/:id',
    VIMEO: '/product/vimeo',
    CLEAR_CACHE: '/products/clear/:userId',
    DELETE: '/product/:id/:userId',
    ADD: '/product/:userId',
    UPDATE: '/product/:id/:userId',
    UPLOAD_EXCEL: '/products/creating',
    DELETE_MULTIPLE: '/products/deleteMultiple/:userId',
    PUSH_TO_TYPES: '/product/pushlist/:id/:userId',
    PUSH_TO_WEEK: '/product/week/:id',
    APPROVE: '/product/approve/:id/:userId',
    CANCEL_APPROVE: '/product/approve/cancel/:id/:userId',
    UPLOAD_ABYSS: '/product/abyss/:id/:userId',
    APPROVE_MULTIPLE: '/products/approvedMultiple/:userId',
    ENCODE_MULTIPLE: '/products/encodeMultipleDailymotionServer/:userId',
    MOST_WATCHED: '/most-watched-episodes',
    AUTO_ADD: '/products/autoAddEpisodeMovie/:userId',
    CLEAR_REDIS: '/products/clear/redis/bull',
    EXPORT_EXCEL: '/products/export/excel'
  },
  COMMENTS: {
    ROOT: '/comments',
    ADD: '/comment/:productId',
    GET_BY_PRODUCT: '/comment/:productId',
    UPDATE: '/comment/:id',
    DELETE: '/comment/:id',
    REPLY: '/comment/:id/reply'
  },
  CART: {
    ROOT: '/cart',
    ADD: '/cart/add',
    REMOVE: '/cart/remove',
    GET_USER_CART: '/cart/user/:userId',
    CLEAR: '/cart/clear'
  },
  TYPES: {
    ROOT: '/types',
    ALL: '/types/all',
    ADD: '/types/add',
    UPDATE: '/types/:id',
    DELETE: '/types/:id'
  },
  CATEGORY_MAIN: {
    ROOT: '/category-main',
    ALL: '/category-main',
    ADD: '/category-main/:userId',
    UPDATE: '/category-main/:id/:userId',
    DELETE: '/category-main/:id/:userId'
  },
  WEEK: {
    ROOT: '/week',
    ALL: '/weeks',
    ADD: '/week/:userId',
    UPDATE: '/week/:id/:userId',
    DELETE: '/week/:id/:userId',
    DELETE_CATEGORY: '/week/category/:id/:userId',
    INSERT_MANY: '/week/insertMany/:id/:userId'
  },
  IMAGE: {
    ROOT: '/image',
    UPLOAD: '/image/upload',
    DELETE: '/image/:id'
  },
  APPROVE: {
    ROOT: '/approve',
    GET_ALL: '/approve/all',
    UPDATE: '/approve/:id',
    DELETE: '/approve/:id'
  },
  BANNER: {
    ROOT: '/banner',
    ALL: '/banner/all',
    ADD: '/banner/add',
    DELETE: '/banner/:id',
    UPDATE: '/banner/:id'
  },
  SEASON: {
    ROOT: '/season',
    ALL: '/season/all',
    ADD: '/season/:userId',
    UPDATE: '/season/:id/:userId',
    DELETE: '/season/:id/:userId'
  },
  TRAILER: {
    ROOT: '/trailer',
    ALL: '/trailer/all',
    ADD: '/trailer/add',
    DELETE: '/trailer/:id'
  },
  REPORT: {
    ROOT: '/report',
    CREATE: '/reports',
    GET_ALL: '/reports/all',
    GET_BY_PRODUCT: '/reports/:productId',
    UPDATE_STATUS: '/reports/:id/status',
    DELETE: '/reports/:id'
  }
} as const;

// Response status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
} as const; 