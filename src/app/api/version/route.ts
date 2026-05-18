import { NextResponse } from "next/server";
import {
  getSemverBase,
  getVersionDisplay,
  PACKAGE_VERSION,
  RELEASE_STAGE,
} from "@/lib/app-version";

export async function GET() {
  return NextResponse.json({
    name: "brasil_caramelo",
    display: getVersionDisplay(),
    package: PACKAGE_VERSION,
    semver: getSemverBase(),
    stage: RELEASE_STAGE,
  });
}
