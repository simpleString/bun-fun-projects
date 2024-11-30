import type { app } from "@backend";
import { edenFetch } from "@elysiajs/eden";

export const fetch = edenFetch<app>("http://localhost:3000");
