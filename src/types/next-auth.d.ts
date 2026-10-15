import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      role?: "admin" | "subadmin" | "editor";
      verified?: boolean;
    };
  }

  interface User {
    id?: string;
    username?: string;
    role?: "admin" | "subadmin" | "editor";
    verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: "admin" | "subadmin" | "editor";
    verified?: boolean;
  }
}
