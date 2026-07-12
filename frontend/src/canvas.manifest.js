export const manifest = {
  screens: {
    scr_d2gepn: { name: "Sign in", route: "/", state: {"screen":"auth","authStep":"login"}, position: {"x":160,"y":220} },
    scr_f5w0o6: { name: "Payout setup", route: "/", state: {"screen":"auth","authStep":"profile"}, position: {"x":1560,"y":220} },
    scr_7muswr: { name: "Dashboard", route: "/", state: {"screen":"home"}, position: {"x":2960,"y":220} },
    scr_m4ez1e: { name: "Bahay 604", route: "/", state: {"screen":"group","groupId":"bahay-604"}, position: {"x":160,"y":2200} },
  },
  sections: {
    sec_2tego6: { name: "Authentication & Setup", x: 0, y: 0, width: 4320, height: 1180 },
    sec_i72bgm: { name: "Property Details", x: 0, y: 1980, width: 1520, height: 1180 },
  },
  layers: [
    { kind: "section", id: "sec_2tego6", children: [
      { kind: "screen", id: "scr_d2gepn" },
      { kind: "screen", id: "scr_f5w0o6" },
      { kind: "screen", id: "scr_7muswr" },
    ] },
    { kind: "section", id: "sec_i72bgm", children: [
      { kind: "screen", id: "scr_m4ez1e" },
    ] },
  ],
}
