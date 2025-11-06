

import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role */
      role: string;
      /** The user's company ID */
      companyId: string | null;
      /** The user's company name */
      companyName: string | null;
      /** The user's first name */
      firstName: string;
      /** The user's last name */
      lastName: string;
      /** Whether this session is impersonating another user */
      isImpersonating?: boolean;
      /** The original user ID when impersonating */
      originalUserId?: string;
      /** The original user email when impersonating */
      originalUserEmail?: string;
      /** The original user role when impersonating */
      originalRole?: string;
      /** The original user first name when impersonating */
      originalFirstName?: string;
      /** The original user last name when impersonating */
      originalLastName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    /** The user's role */
    role: string;
    /** The user's company ID */
    companyId: string | null;
    /** The user's company name */
    companyName: string | null;
    /** The user's first name */
    firstName: string;
    /** The user's last name */
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's role */
    role: string;
    /** The user's company ID */
    companyId: string | null;
    /** The user's company name */
    companyName: string | null;
    /** The user's first name */
    firstName: string;
    /** The user's last name */
    lastName: string;
    /** Whether this token is impersonating another user */
    isImpersonating?: boolean;
    /** The original user ID when impersonating */
    originalUserId?: string;
    /** The original user email when impersonating */
    originalUserEmail?: string;
    /** The original user role when impersonating */
    originalRole?: string;
    /** The original user first name when impersonating */
    originalFirstName?: string;
    /** The original user last name when impersonating */
    originalLastName?: string;
  }
}
