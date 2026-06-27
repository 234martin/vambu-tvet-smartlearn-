export const CBET_LEVELS = [
  { value: "level_2", short: "Level 2", label: "Pre-Vocational Foundation" },
  { value: "level_3", short: "Level 3", label: "Artisan Certificate" },
  { value: "level_4", short: "Level 4", label: "Craft Certificate" },
  { value: "level_5", short: "Level 5", label: "Technician Level" },
  { value: "level_6", short: "Level 6", label: "Diploma Level" },
];

export function getLevelInfo(value) {
  return CBET_LEVELS.find((l) => l.value === value) || null;
}

export function levelNumber(value) {
  if (!value) return null;
  return value.replace("level_", "");
}

export const CONTENT_TYPE_LABELS = {
  note: "Note",
  past_paper: "Past Paper",
  marking_scheme: "Marking Scheme",
  video: "Video",
};

export const ROLE_LABELS = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};
