/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as Cartesia from "../../../index";

export interface TokenRequest {
    /** The permissions to be granted via the token. */
    grants: Cartesia.TokenGrant;
    /** The number of seconds the token will be valid for since the time of generation. The maximum is 1 hour (3600 seconds). */
    expiresIn?: number;
}
