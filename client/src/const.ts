export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the path to the admin login page.
 * The Admin page (/admin) handles its own login form when the user is not authenticated.
 */
export const getLoginUrl = () => "/admin";
