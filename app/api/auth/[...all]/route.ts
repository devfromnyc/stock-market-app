import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/better-auth/auth";

const getHandler = async () => {
  const auth = await getAuth();
  return toNextJsHandler(auth);
};

export async function GET(request: Request) {
  const { GET: handler } = await getHandler();
  return handler(request);
}

export async function POST(request: Request) {
  const { POST: handler } = await getHandler();
  return handler(request);
}
