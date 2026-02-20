const PATHS = {
  home: ["M3 11l9-8 9 8", "M5 10v10h14V10"],
  store: ["M3 10h18", "M5 10v10h14V10", "M9 20v-5h6v5"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0-.01", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  merge: ["M6 3v6a3 3 0 0 0 3 3h6", "M18 21v-6a3 3 0 0 0-3-3H9", "M18 3v4", "M18 17v4"],
  card: ["M2 7h20", "M2 5h20v14H2z", "M6 15h4"],
  alert: ["M12 8v4", "M12 16h.01", "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"],
  help: ["M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4", "M12 17h.01", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6", "M10 11v6M14 11v6"],
  info: ["M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
  user: ["M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"],
  mail: ["M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"],
  lock: ["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z", "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"],
  eyeOff: ["M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1-2.87 2.87-5.1 5.14-6.43", "M1 1l22 22", "M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11 11 0 0 1-4.24 5.06", "M14.12 14.12a3 3 0 0 1-4.24-4.24"],
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
