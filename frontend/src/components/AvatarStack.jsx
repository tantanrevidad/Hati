import React from "react";
import { getInitials, getAvatarColor, getUserById } from "../data/mockData";

export default function AvatarStack({ userIds = [], size = "sm", max = 4 }) {
  const shown = userIds.slice(0, max);
  const extra = userIds.length - max;

  const sizeMap = { sm: "avatar-sm", md: "avatar-md", lg: "avatar-lg" };

  return (
    <div className="avatar-stack">
      {shown.map((uid) => {
        const user = getUserById(uid);
        if (!user) return null;
        return (
          <div
            key={uid}
            className={`avatar ${sizeMap[size]}`}
            style={{ background: getAvatarColor(uid), color: "#fff" }}
            title={user.displayName}
          >
            {getInitials(user.displayName)}
          </div>
        );
      })}
      {extra > 0 && (
        <div
          className={`avatar ${sizeMap[size]}`}
          style={{ background: "var(--color-surface-2)", color: "var(--color-text-2)", fontSize: "0.625rem" }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
