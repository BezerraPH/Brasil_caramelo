import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const PROTECTED =
  /^\/(feed|perfil|configuracoes|amigos|buscar|cachorro|ranking|casinhas|casinha|rolezinho|batalha|premium|explorar|salvos|notificacoes|mensagens|latidos|tribunal)(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.test(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session) {
    return NextResponse.next();
  }

  const login = request.nextUrl.clone();
  login.pathname = "/entrar";
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/feed",
    "/feed/:path*",
    "/perfil/:path*",
    "/configuracoes",
    "/amigos",
    "/buscar",
    "/cachorro",
    "/ranking",
    "/casinhas",
    "/casinha/:path*",
    "/rolezinho",
    "/batalha",
    "/premium",
    "/explorar",
    "/salvos",
    "/notificacoes",
    "/mensagens",
    "/latidos",
    "/latidos/:path*",
    "/tribunal",
  ],
};
