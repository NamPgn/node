export const PASSWORD_LENGTH = 8;
export const SECRET_KEY = 'nampg';
export const EXPIRES_IN = 365 * 24 * 60 * 60;
export const DEFAULT_LIMIT = 40;
export const KEY_PRODUCTS_REDIS = ''
export const KEY_CATEGORY_REDIS = ''



export const ALLOWED_ORIGINS = [
	'https://hhhihi.site',
	'https://tromphim.site',
	'http://localhost:3000',
	'http://localhost:3001',
	'http://localhost:5173',
	'http://localhost:5174',
	'http://127.0.0.1:5173',
	'http://127.0.0.1:5174',
	'https://feature-fix--testmoviee.netlify.app',
	'https://testmoviee.netlify.app',
]


export const SET_HEADER = {
	AccessControlAllowOrigin: "Access-Control-Allow-Origin",
	AccessControlAllowMethods: 'GET, POST, PUT, DELETE, OPTIONS',
	AccessControlAllowHeaders: 'Content-Type, Authorization',
}


export const CHANNELS = {
	// ... existing channels ...
	PRODUCT_UPDATE: 'product:update',
	PRODUCT_CREATE: 'product:create',
	PRODUCT_DELETE: 'product:delete'
  };
  