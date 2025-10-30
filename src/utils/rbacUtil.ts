 /**
 * Structure of the RBAC policy map:
 * {
 *   ROLE: {
 *     RESOURCE: {
 *       PERMISSION: {
 *         SCOPE: POLICY_ID
 *       }
 *     }
 *   }
 * }
 *
 * Example:
 * {
 *   "ADMIN": {
 *     "USER": {
 *       "READ": { "GLOBAL": "1234abcd" },
 *       "UPDATE": { "SELF": "5678efgh" }
 *     }
 *   }
 * }
 */