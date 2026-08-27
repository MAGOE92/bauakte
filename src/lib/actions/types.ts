export type ActionResult =
  | { status: "ok"; id: string }
  | { status: "error"; message: string };
